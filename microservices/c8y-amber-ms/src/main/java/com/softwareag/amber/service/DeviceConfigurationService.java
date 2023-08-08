package com.softwareag.amber.service;

import com.boonamber.models.Model;
import com.boonamber.models.PostDataResponse;
import com.cumulocity.microservice.context.ContextService;
import com.cumulocity.microservice.context.credentials.MicroserviceCredentials;
import com.cumulocity.model.JSONBase;
import com.cumulocity.model.idtype.GId;
import com.cumulocity.model.measurement.MeasurementValue;
import com.cumulocity.rest.representation.event.EventRepresentation;
import com.cumulocity.rest.representation.inventory.ManagedObjectRepresentation;
import com.cumulocity.rest.representation.measurement.MeasurementRepresentation;
import com.cumulocity.sdk.client.PlatformImpl;
import com.cumulocity.sdk.client.SDKException;
import com.cumulocity.sdk.client.event.EventApi;
import com.cumulocity.sdk.client.inventory.InventoryApi;
import com.cumulocity.sdk.client.inventory.InventoryFilter;
import com.cumulocity.sdk.client.inventory.ManagedObjectCollection;
import com.cumulocity.sdk.client.measurement.MeasurementApi;
import com.cumulocity.sdk.client.notification.Subscription;
import com.cumulocity.sdk.client.notification.SubscriptionListener;
import com.softwareag.amber.model.CumulocityDataPoint;
import com.softwareag.amber.model.ServiceDataStream;
import com.softwareag.amber.notification.MeasurementNotification;
import com.softwareag.amber.notification.MeasurementRealtimeNotificationSubscriber;
import lombok.extern.slf4j.Slf4j;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpServerErrorException;
import org.svenson.AbstractDynamicProperties;
import org.svenson.JSON;
import org.svenson.JSONParser;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service
public class DeviceConfigurationService {
    private static final int TWELVE_HOURS_IN_MILLISECONDS = 1000 * 60 * 60 * 12;

    private final InventoryApi inventoryApi;

    private final MeasurementApi measurementApi;

    private final EventApi eventApi;

    private final AmberService amberService;

    private final ContextService<MicroserviceCredentials> contextService;

    private final MeasurementRealtimeNotificationSubscriber subscriber;

    private final JSONParser jsonParser = JSONBase.getJSONParser();

    private final JSON json = JSON.defaultJSON();

    private final Map<String, Model> sensors = new HashMap<>();

    private final Map<String, PostDataResponse> sensorStreamingData = new HashMap<>();

    private final Map<String, BigDecimal[]> deviceDataVectors = new HashMap<>();

    private final Map<String, Subscription<String>> measurementSubscriptions = new HashMap<>();

    private MicroserviceCredentials credentials;

    @Autowired
    public DeviceConfigurationService(PlatformImpl platform, InventoryApi inventoryApi, MeasurementApi measurementApi,
                                      EventApi eventApi, AmberService amberService, ContextService<MicroserviceCredentials> contextService) {
        this.inventoryApi = inventoryApi;
        this.measurementApi = measurementApi;
        this.eventApi = eventApi;
        this.amberService = amberService;
        this.contextService = contextService;
        subscriber = new MeasurementRealtimeNotificationSubscriber(platform);
    }

    public void init(final MicroserviceCredentials credentials) {
        this.credentials = credentials;
        initDeviceConfigurations();
        initMeasurementSubscriptions();
    }

    public void initDeviceConfigurations() {
        try {
            final ManagedObjectCollection managedObjectCollection = inventoryApi.getManagedObjectsByFilter(new InventoryFilter().byFragmentType(Model.class));
            final List<ManagedObjectRepresentation> devices = managedObjectCollection.get(2000).getManagedObjects();

            devices.forEach((device) -> {
                final Model sensor = jsonParser.parse(Model.class, json.forValue(new Model()));
                final PostDataResponse sensorStreamData = jsonParser.parse(PostDataResponse.class, json.forValue(new PostDataResponse()));

                sensors.put(device.getId().getValue(), sensor);
                sensorStreamingData.put(device.getId().getValue(), sensorStreamData);
            });

            log.info("devices configured: {}", sensors.toString());
        } catch (SDKException exception) {
            log.error("Failed to initialize device configuration", exception);
        }
    }

    public void initMeasurementSubscriptions() {
        if (!amberService.isConnected()) {
            log.info("[initMeasurementSubscriptions] not connected to Amber");
            return;
        }

        for (Map.Entry<String, Model> entry : sensors.entrySet()) {
//            final Model sensor = entry.getValue();
            final String deviceId = entry.getKey();

            // why are we checking streaming here?
//            if (sensor.isStreaming()) {
            Boolean streaming = true;
            if (streaming) {
                registerForMeasurementNotifications(deviceId);
            }
        }
    }

    public Optional<Model> getSensorInformation(final String deviceId) {
        if (!sensors.containsKey(deviceId)) {
            return Optional.empty();
        }

        return Optional.of(sensors.get(deviceId));
    }

    public void deleteSensorFromAmber(final String deviceId) {
        if (!sensors.containsKey(deviceId)) {
            throw new HttpServerErrorException(HttpStatus.NOT_FOUND);
        }

        final Model sensor = sensors.get(deviceId);
        amberService.deleteSensor(sensor.getId());
        cancelMeasurementSubscription(deviceId);
        updateCumulocityDeviceRepresentationAndRemoveConfiguration(deviceId);
        sensors.remove(deviceId);
    }

    public void updateDeviceWithAmberSensorConfiguration(final String deviceId, final Model amberSensor) {
        updateCumulocityDeviceRepresentationWithConfiguration(deviceId, amberSensor, true);
        sensors.put(deviceId, amberSensor);
        sensorStreamingData.remove(deviceId);
        updateMeasurementNotificationSubscription(deviceId);
    }

    public void cancelMeasurementSubscriptions() {
        final Set<String> deviceIdsWithSubscriptions = Set.copyOf(measurementSubscriptions.keySet());
        for (String deviceId : deviceIdsWithSubscriptions) {
            cancelMeasurementSubscription(deviceId);
        }
    }

    public void cancelMeasurementSubscription(final String deviceId) {
        if (!measurementSubscriptions.containsKey(deviceId)) {
            return;
        }

        final Subscription<String> measurementSubscription = measurementSubscriptions.get(deviceId);
        measurementSubscription.unsubscribe();

        measurementSubscriptions.remove(deviceId);
    }

    public void updateMeasurementNotificationSubscription(final String deviceId) {
        // cancel and remove subscription first and subscribe again for measurement notifications
        if (measurementSubscriptions.containsKey(deviceId)) {
            final Subscription<String> measurementSubscription = measurementSubscriptions.get(deviceId);
            measurementSubscription.unsubscribe();
            measurementSubscriptions.remove(deviceId);
        }

        registerForMeasurementNotifications(deviceId);
    }

    private void registerForMeasurementNotifications(final String deviceId) {
        final Model sensor = sensors.get(deviceId);
        final CumulocityDataPoint[] dataPoints = sensor.getDataPoints();
        deviceDataVectors.put(deviceId, new BigDecimal[dataPoints.length]);

        final Subscription<String> measurementSubscription = subscriber.subscribe(deviceId, new SubscriptionListener<>() {
            @Override
            public void onNotification(Subscription<String> arg0, MeasurementNotification notification) {
                contextService.runWithinContext(credentials, () -> {
                    BigDecimal[] dataVector = deviceDataVectors.get(deviceId);
                    final MeasurementRepresentation measurement = jsonParser.parse(MeasurementRepresentation.class, json.forValue(notification.getData()));

                    // TODO filter measurement based on type
//                boolean isMeasurementRelevant = false;
//                for (CumulocityDataPoint datapoint : dataPoints) {
//                    if (measurement.getType().equals(datapoint.getType())) {
//                        isMeasurementRelevant = true;
//                    }
//                }
//
//                if (!isMeasurementRelevant) {
//                    return;
//                }

                    dataVector = writeMeasurementToDataVector(measurement, dataPoints, dataVector);
                    if (!isDataVectorValid(dataVector)) {
                        return;
                    }
                    final PostDataResponse amberStreamDataResponse = sendDataVectorToAmber(sensor.getId(), dataVector);
                    // TODO does this work with a get and a set?
                    amberStreamDataResponse.getStatus().setSampleCount(increaseSampleCount(sensorStreamingData.get(deviceId)));
                    // reset data vector
                    deviceDataVectors.put(deviceId, new BigDecimal[dataPoints.length]);

                    updateCumulocityDeviceWithAmberStatus(deviceId, amberStreamDataResponse);
                    final Optional<Map<String, Object>> rootCauseMeasurementFragments = createRootCauseMeasurement(deviceId,
                            amberStreamDataResponse, sensor);
                    createAmberStreamDataStatusMeasurement(deviceId, amberStreamDataResponse, rootCauseMeasurementFragments);

                    // only create Amber state event if the state has been changed
                    if (!sensorStreamingData.containsKey(deviceId)
                            || isAmberSensorStateChanged(sensorStreamingData.get(deviceId), amberStreamDataResponse)
                            || isMonitoringEventAndTimeForLastMonitoringEventElapsed(amberStreamDataResponse, sensor)) {
                        createAmberStateEvent(deviceId, amberStreamDataResponse);
                    }

                    sensorStreamingData.put(deviceId, amberStreamDataResponse);
                });
            }

            @Override
            public void onError(Subscription<String> arg0, Throwable arg1) {
                log.error("An error occurred for the measurement subscription", arg1);
            }
        });

        measurementSubscriptions.put(deviceId, measurementSubscription);
    }

    private PostDataResponse sendDataVectorToAmber(final String amberSensorId, final BigDecimal[] dataVector) {
        final String dataVectorPayload = Arrays.toString(dataVector).replace("[", "").replace("]", "").replace(" ", "");
        return amberService.streamData(amberSensorId, new ServiceDataStream(dataVectorPayload));
    }

    private void updateCumulocityDeviceWithAmberStatus(final String deviceId, final PostDataResponse streamData) {
        contextService.runWithinContext(credentials, () -> {
            final ManagedObjectRepresentation managedObjectRepresentation = new ManagedObjectRepresentation();
            managedObjectRepresentation.setId(new GId(deviceId));
            managedObjectRepresentation.set(streamData);

            try {
                inventoryApi.update(managedObjectRepresentation);
            } catch (SDKException exception) {
                log.error("failed to update Amber sensor status", exception);
            }
        });
    }

    private Optional<Map<String, Object>> createRootCauseMeasurement(final String deviceId, final PostDataResponse streamData,
                                                                     final Model sensor) {
        if (StringUtils.isEmpty(deviceId) || streamData == null || sensor == null) {
            log.error("Parameters must not be null");
            return Optional.empty();
        }

        // only query root cause and create rootCause measurement if an anomaly is detected
        if (streamData.getAnalytics().getAD() == null || streamData.getAnalytics().getAD().size() == 0 || streamData.getAnalytics().getAD().get(0) == 0) {
            return Optional.empty();
        }

        if (streamData.getAnalytics().getID() == null || streamData.getAnalytics().getID().size() == 0) {
            return Optional.empty();
        }

        final int clusterId = streamData.getAnalytics().getID().get(0);
        final double[] rootCause = amberService.getRootCause(sensor.getId(), clusterId);

        if (rootCause == null || rootCause.length == 0) {
            return Optional.empty();
        }

        final Optional<Map<String, Object>> rootCauseMeasurementFragments = createRootCauseMeasurementFragments(deviceId,
                rootCause, sensor.getDataPoints());
        return rootCauseMeasurementFragments;
    }

    private void createAmberStreamDataStatusMeasurement(final String deviceId, final PostDataResponse streamData,
                                                        final Optional<Map<String, Object>> rootCauseMeasurementFragments) {
        final ManagedObjectRepresentation managedObjectRepresentation = new ManagedObjectRepresentation();
        managedObjectRepresentation.setId(new GId(deviceId));
        final MeasurementRepresentation measurementRepresentation = new MeasurementRepresentation();
        measurementRepresentation.setSource(managedObjectRepresentation);
        measurementRepresentation.setType("c8y_AmberStatus");
        measurementRepresentation.setDateTime(DateTime.now());

        if (streamData.getAnalytics().getID() != null && streamData.getAnalytics().getID().size() > 0
                && streamData.getAnalytics().getSI() != null && streamData.getAnalytics().getSI().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("id", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getID().get(0)), ""));
            measurementRepresentation.setProperty("c8y_cluster_id", fragment);
        }

        if (streamData.getAnalytics().getSI() != null && streamData.getAnalytics().getSI().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("si", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getSI().get(0)), "idx"));
            measurementRepresentation.setProperty("c8y_anomaly_index", fragment);
        }

        if (streamData.getAnalytics().getAW() != null && streamData.getAnalytics().getAW().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("aw", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getAW().get(0)), "int"));
            measurementRepresentation.setProperty("c8y_aw", fragment);
        }

        if (streamData.getAnalytics().getAD() != null && streamData.getAnalytics().getAD().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("ad", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getAD().get(0)), "bin"));
            measurementRepresentation.setProperty("c8y_ad", fragment);
        }
        
        if (streamData.getAnalytics().getNI() != null && streamData.getAnalytics().getNI().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("ni", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getNI().get(0)), "bin"));
            measurementRepresentation.setProperty("c8y_ni", fragment);
        }
        
        if (streamData.getAnalytics().getPI() != null && streamData.getAnalytics().getPI().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("pi", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getPI().get(0)), "bin"));
            measurementRepresentation.setProperty("c8y_pi", fragment);
        }
        
        if (streamData.getAnalytics().getNW() != null && streamData.getAnalytics().getNW().size() > 0) {
            Map<String, Object> fragment = new HashMap<>();
            fragment.put("nw", new MeasurementValue(new BigDecimal(streamData.getAnalytics().getNW().get(0)), "bin"));
            measurementRepresentation.setProperty("c8y_nw", fragment);
        }

        if (rootCauseMeasurementFragments.isPresent()) {
            measurementRepresentation.setProperty("c8y_AmberRootCause", rootCauseMeasurementFragments.get());
        }

        Map<String, Object> sampleCountFragment = new HashMap<>();
        sampleCountFragment.put("sample_count", new MeasurementValue(new BigDecimal(streamData.getStatus().getSampleCount()), ""));
        measurementRepresentation.setProperty("c8y_sample_count", sampleCountFragment);

        measurementApi.createWithoutResponse(measurementRepresentation);
    }

    private void createAmberStateEvent(final String deviceId, final PostDataResponse streamData) {
        if (streamData == null || StringUtils.isEmpty(streamData.getStatus().getState())) {
            return;
        }

        final ManagedObjectRepresentation managedObjectRepresentation = new ManagedObjectRepresentation();
        managedObjectRepresentation.setId(new GId(deviceId));
        final EventRepresentation eventRepresentation = new EventRepresentation();
        eventRepresentation.setSource(managedObjectRepresentation);
        eventRepresentation.setDateTime(DateTime.now());
        eventRepresentation.setType("c8y_nano_state");
        eventRepresentation.setText(streamData.getStatus().getState().getValue());
        eventRepresentation.setProperty("state_flow", streamData.getStatus().getState());

        eventApi.createAsync(eventRepresentation);
    }

    private void updateCumulocityDeviceRepresentationWithConfiguration(final String deviceId, final Model sensor,
                                                                       final boolean isClearSensorStatus) {
        final ManagedObjectRepresentation managedObjectRepresentation = new ManagedObjectRepresentation();
        managedObjectRepresentation.setId(new GId(deviceId));
        managedObjectRepresentation.set(sensor);

        if (isClearSensorStatus) {
            // reset sensor status to default after configuration has been changed
            managedObjectRepresentation.set(null, "c8y_AmberSensorStatus");
        }

        try {
            inventoryApi.update(managedObjectRepresentation);
        } catch (SDKException exception) {
            log.error("failed to update Amber configuration", exception);
        }
    }

    private void updateCumulocityDeviceRepresentationAndRemoveConfiguration(final String deviceId) {
        final ManagedObjectRepresentation managedObjectRepresentation = new ManagedObjectRepresentation();
        managedObjectRepresentation.setId(new GId(deviceId));
        managedObjectRepresentation.set(null, "c8y_AmberSensorConfiguration");

        try {
            inventoryApi.update(managedObjectRepresentation);
        } catch (SDKException exception) {
            log.error("failed to clear Amber configuration", exception);
        }
    }

    private BigDecimal[] writeMeasurementToDataVector(final MeasurementRepresentation measurementRepresentation, final CumulocityDataPoint[] dataPoints,
                                                      final BigDecimal[] dataVector) {
        if (dataPoints == null || dataPoints.length == 0) {
            log.error("No data points defined");
            return new BigDecimal[0];
        }

        for (int index = 0; index < dataPoints.length; index++) {
            CumulocityDataPoint dataPoint = dataPoints[index];
            if (!measurementRepresentation.hasProperty(dataPoint.getFragment())) {
                continue;
            }

            final Map<String, Object> fragment = getMeasurementFragment(measurementRepresentation, dataPoint.getFragment());
            if (!fragment.containsKey(dataPoint.getSeries())) {
                continue;
            }

            final MeasurementValue measurementValue = jsonParser.parse(MeasurementValue.class, json.forValue(fragment.get(dataPoint.getSeries())));
            dataVector[index] = measurementValue.getValue();
        }

        return dataVector;
    }

    private boolean isDataVectorValid(final BigDecimal[] dataVector) {
        if (dataVector == null || dataVector.length == 0) {
            log.error("Data vector is not available.");
            return false;
        }

        for (BigDecimal entry : dataVector) {
            if (entry == null) {
                return false;
            }
        }

        return true;
    }

    private boolean isAmberSensorStateChanged(final PostDataResponse oldStreamData, final PostDataResponse newStreamData) {
        if (oldStreamData == null || newStreamData == null) {
            return false;
        }

        return !oldStreamData.getStatus().getState().equals(newStreamData.getStatus().getState());
    }

    private boolean isMonitoringEventAndTimeForLastMonitoringEventElapsed(final PostDataResponse amberStreamData,
                                                                          final Model sensor) {
        if (amberStreamData == null || sensor == null) {
            return false;
        }

        if (!amberStreamData.getStatus().getState().equals("Monitoring")) {
            return false;
        }

        final DateTime currentTime = new DateTime();

        // if timestamp hasn't been set yet or if twelve hours have elapsed since the last monitoring event send
        // out a new monitoring event
        Long lastModified = Long.parseLong(sensor.getModified());
        if (lastModified == 0
                || (lastModified <= currentTime.getMillis() - TWELVE_HOURS_IN_MILLISECONDS)) {
            return true;
        }

        return false;
    }

    private int increaseSampleCount(final PostDataResponse oldStreamData) {
        // if there isn't a stream dataset available, then we can assume it's the first sample, which has been sent
        if (oldStreamData == null) {
            return 1;
        }

        return oldStreamData.getStatus().getSampleCount() + 1;
    }

    private Map<String, Object> getMeasurementFragment(final MeasurementRepresentation measurementRepresentation,
                                                       final String fragmentName) {
        final Object measurementObject = measurementRepresentation.getProperty(fragmentName);
        Map<String, Object> fragment;
        if (measurementObject instanceof Map) {
            fragment = (Map<String, Object>) measurementObject;
        } else if (measurementObject instanceof AbstractDynamicProperties) {
            fragment = ((AbstractDynamicProperties) measurementObject).getAttrs();
        } else {
            throw new ClassCastException();
        }

        return fragment;
    }

    private Optional<Map<String, Object>> createRootCauseMeasurementFragments(final String deviceId, final double[] rootCause,
                                                                              final CumulocityDataPoint[] dataPoints) {
        if (rootCause == null || rootCause.length == 0) {
            return Optional.empty();
        }

        Map<String, Object> fragments = new HashMap<>();

        for (int index = 0; index < rootCause.length; index++) {
            if (index >= dataPoints.length) {
                log.error("root cause vector does not match data points");
                break;
            }

            final String datapointName = dataPoints[index].getFragment() + "-" + dataPoints[index].getSeries();
            fragments.put(datapointName, new MeasurementValue(new BigDecimal(rootCause[index]), ""));
        }

        return Optional.of(fragments);
    }
}
