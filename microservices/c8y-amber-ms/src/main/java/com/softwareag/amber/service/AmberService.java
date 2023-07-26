package com.softwareag.amber.service;

import com.boonamber.AmberV2Client;
import com.boonamber.ApiException;
import com.boonamber.LicenseProfile;
import com.boonamber.models.*;
import com.boonamber.models.FeatureConfig.FusionRuleEnum;
import com.softwareag.amber.model.AmberSensor;
import com.softwareag.amber.model.AmberSensorConfiguration;
import com.softwareag.amber.model.AmberStreamData;
import com.softwareag.amber.model.ServiceDataStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;

import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AmberService {

    private static final String ERROR_CONNECTION_NOT_ESTABLISHED = "Amber connection not established!";
    
    private AmberV2Client client;

    public boolean checkAuthentication(final String url, final String licenseKey, final String secretKey) {
    	try {
    		LicenseProfile auth = new LicenseProfile(url, licenseKey, secretKey);
    		AmberV2Client test = new AmberV2Client(auth);
    		test.getVersion();
    	} catch (ApiException e) {
    		return false;
    	}
    	return true;
    }

    public void initializeConnection(final String url, final String licenseKey, final String secretKey) {
    	try {
    		LicenseProfile auth = new LicenseProfile(url, licenseKey, secretKey);
    		client = new AmberV2Client(auth);
    	} catch (ApiException e) {
    		throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    	}
    }

    public void clearConnection() {
        client = null;
    }

    public Optional<AmberSensor> getSensor(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        AmberSensor sensor = new AmberSensor();
        try {
        	PostModelResponse model = client.getModel(sensorId);
        	
        	// TODO remove conversion if using boonamber models
        	sensor.setLabel(model.getLabel());
        	sensor.setSensorId(model.getId());
        	sensor.setStreaming(true);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        
        return Optional.of(sensor);
    }

    public AmberSensor createSensor() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        AmberSensor sensor = new AmberSensor();
        try {
        	PostModelRequest label = new PostModelRequest();
            label.setLabel("Cumulocity-dashboard");
            
        	PostModelResponse model = client.postModel(label);
        	
        	// TODO remove conversion if using boonamber models
        	sensor.setLabel(model.getLabel());
        	sensor.setSensorId(model.getId());
        	sensor.setStreaming(true);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return sensor;
    }

    public void deleteSensor(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        try {
        	client.deleteModel(sensorId);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    public AmberSensor[] getSensors() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        GetModelsResponse models = null;
        try {
        	models = client.getModels();
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        
    	// TODO remove conversion if using boonamber models
        AmberSensor[] sensors = new AmberSensor[models.getModelList().size()];
        for (int i = 0; i < models.getModelList().size(); i++) {
        	sensors[i].setLabel(models.getModelList().get(i).getLabel());
        	sensors[i].setSensorId(models.getModelList().get(i).getId());
        	sensors[i].setStreaming(true);
        }
        return sensors;
    }

    public AmberSensorConfiguration getSensorConfiguration(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        AmberSensorConfiguration sensorConfig = new AmberSensorConfiguration();
        try {            
        	PostConfigResponse modelConfig = client.getConfig(sensorId);
        	
        	// TODO remove conversion if using boonamber models
        	sensorConfig.setFeatureCount(modelConfig.getFeatures().size());
        	sensorConfig.setStreamingWindowSize(modelConfig.getStreamingWindow());
        	sensorConfig.setPercentVariation(modelConfig.getPercentVariation());
        	// training
        	sensorConfig.setSamplesToBuffer(modelConfig.getTraining().getBufferingSamples());
        	sensorConfig.setAnomalyHistoryWindow(modelConfig.getTraining().getHistoryWindow());
        	sensorConfig.setLearningMaxClusters(modelConfig.getTraining().getLearningMaxClusters());
        	sensorConfig.setLearningMaxSamples(modelConfig.getTraining().getLearningMaxSamples());
        	sensorConfig.setLearningRateNumerator(modelConfig.getTraining().getLearningRateNumerator());
        	sensorConfig.setLearningRateDenominator(modelConfig.getTraining().getLearningRateDenominator());
        	// features
        	AmberSensorConfiguration.Feature[] sensorFeatures = new AmberSensorConfiguration.Feature[modelConfig.getFeatures().size()]; 
        	for (int i = 0; i < modelConfig.getFeatures().size(); i ++) {
        		sensorFeatures[i].setLabel(modelConfig.getFeatures().get(i).getName());
        		sensorFeatures[i].setMinVal(modelConfig.getFeatures().get(i).getMinVal());
        		sensorFeatures[i].setMaxVal(modelConfig.getFeatures().get(i).getMaxVal());
        		sensorFeatures[i].setSubmitRule(modelConfig.getFeatures().get(i).getFusionRule().getValue());
        	}
        	sensorConfig.setFeatures(sensorFeatures);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

        return sensorConfig;
    }

    public AmberSensorConfiguration createSensorConfiguration(final String sensorId, final AmberSensorConfiguration configuration) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        // TODO remove conversion to boonamber model
        PostConfigRequest request = new PostConfigRequest();
        request.setStreamingWindow(configuration.getStreamingWindowSize());
        request.setPercentVariation((float)configuration.getPercentVariation());
        // autotuning
        AutotuneConfig ac = new AutotuneConfig();
        ac.setPercentVariation(true);
        ac.setRange(true);
        request.setAutotuning(ac);
        // training
        TrainingConfig tc = new TrainingConfig();
        tc.setBufferingSamples((int)configuration.getSamplesToBuffer());
        tc.setHistoryWindow(configuration.getAnomalyHistoryWindow());
        tc.setLearningMaxClusters(configuration.getLearningMaxClusters());
        tc.setLearningMaxSamples((int)configuration.getLearningMaxSamples());
        tc.setLearningRateNumerator((int)configuration.getLearningRateNumerator());
        tc.setLearningRateDenominator((int)configuration.getLearningRateDenominator());
        request.setTraining(tc);
        // features
        List<FeatureConfig> fc = new ArrayList<FeatureConfig>();
        for (int i = 0; i < configuration.getFeatureCount(); i++) {
        	FeatureConfig f = new FeatureConfig();
        	f.setMaxVal((float)configuration.getFeatures()[i].getMaxVal());
        	f.setMinVal((float)configuration.getFeatures()[i].getMinVal());
        	f.setName(configuration.getFeatures()[i].getLabel());
        	f.setFusionRule(FusionRuleEnum.fromValue(configuration.getFeatures()[i].getSubmitRule()));
        	fc.add(f);
        }
        request.setFeatures(fc);
        
        AmberSensorConfiguration sensorConfig = new AmberSensorConfiguration();
        try {            
        	PostConfigResponse modelConfig = client.postConfig(sensorId, request);
        	
        	// TODO remove conversion if using boonamber models
        	sensorConfig.setFeatureCount(modelConfig.getFeatures().size());
        	sensorConfig.setStreamingWindowSize(modelConfig.getStreamingWindow());
        	sensorConfig.setPercentVariation(modelConfig.getPercentVariation());
        	// training
        	sensorConfig.setSamplesToBuffer(modelConfig.getTraining().getBufferingSamples());
        	sensorConfig.setAnomalyHistoryWindow(modelConfig.getTraining().getHistoryWindow());
        	sensorConfig.setLearningMaxClusters(modelConfig.getTraining().getLearningMaxClusters());
        	sensorConfig.setLearningMaxSamples(modelConfig.getTraining().getLearningMaxSamples());
        	sensorConfig.setLearningRateNumerator(modelConfig.getTraining().getLearningRateNumerator());
        	sensorConfig.setLearningRateDenominator(modelConfig.getTraining().getLearningRateDenominator());
        	// features
        	AmberSensorConfiguration.Feature[] sensorFeatures = new AmberSensorConfiguration.Feature[modelConfig.getFeatures().size()]; 
        	for (int i = 0; i < modelConfig.getFeatures().size(); i ++) {
        		sensorFeatures[i].setLabel(modelConfig.getFeatures().get(i).getName());
        		sensorFeatures[i].setMinVal(modelConfig.getFeatures().get(i).getMinVal());
        		sensorFeatures[i].setMaxVal(modelConfig.getFeatures().get(i).getMaxVal());
        		sensorFeatures[i].setSubmitRule(modelConfig.getFeatures().get(i).getFusionRule().getValue());
        	}
        	sensorConfig.setFeatures(sensorFeatures);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

        return sensorConfig;
    }

    public AmberStreamData streamData(final String sensorId, final ServiceDataStream serviceDataStream) throws HttpServerErrorException {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        AmberStreamData sensorData = new AmberStreamData();
        try {
        	PostDataRequest request = new PostDataRequest();
        	request.setData(serviceDataStream.getData());
        	
        	PostDataResponse modelData = client.postData(sensorId, request);
        	
        	// TODO remove conversion if using boonamber models
        	sensorData.setState(modelData.getStatus().getState().getValue());
        	sensorData.setMessage(modelData.getStatus().getMessage());
        	sensorData.setClusterCount(modelData.getStatus().getClusterCount());
        	sensorData.setSampleCount(modelData.getStatus().getSampleCount());
        	sensorData.setProgress(modelData.getStatus().getProgress());
        	sensorData.setRetryCount(0);
        	sensorData.setTotalInferences(modelData.getStatus().getSampleCount());
        	
        	int[] ad = new int[modelData.getAnalytics().getAD().size()];
        	for (int i = 0; i < modelData.getAnalytics().getAD().size(); i++) {
        		ad[i] = modelData.getAnalytics().getAD().get(i);
        	}
        	sensorData.setAD(ad);
        	
        	int[] ah = new int[modelData.getAnalytics().getAH().size()];
        	for (int i = 0; i < modelData.getAnalytics().getAH().size(); i++) {
        		ah[i] = modelData.getAnalytics().getAH().get(i);
        	}
        	sensorData.setAH(ah);
        	// no AM anymore
        	int[] aw = new int[modelData.getAnalytics().getAW().size()];
        	for (int i = 0; i < modelData.getAnalytics().getAW().size(); i++) {
        		aw[i] = modelData.getAnalytics().getAW().get(i);
        	}
        	sensorData.setAW(aw);
        	
        	int[] id = new int[modelData.getAnalytics().getID().size()];
        	for (int i = 0; i < modelData.getAnalytics().getID().size(); i++) {
        		id[i] = modelData.getAnalytics().getID().get(i);
        	}
        	sensorData.setID(id);

        	int[] ri = new int[modelData.getAnalytics().getRI().size()];
        	for (int i = 0; i < modelData.getAnalytics().getRI().size(); i++) {
        		ri[i] = modelData.getAnalytics().getRI().get(i);
        	}
        	sensorData.setRI(ri);

        	int[] si = new int[modelData.getAnalytics().getSI().size()];
        	for (int i = 0; i < modelData.getAnalytics().getSI().size(); i++) {
        		si[i] = modelData.getAnalytics().getSI().get(i);
        	}
        	sensorData.setSI(si);

        	int[] ni = new int[modelData.getAnalytics().getNI().size()];
        	for (int i = 0; i < modelData.getAnalytics().getNI().size(); i++) {
        		ni[i] = modelData.getAnalytics().getNI().get(i);
        	}
        	sensorData.setNI(ni);

        	int[] ns = new int[modelData.getAnalytics().getNS().size()];
        	for (int i = 0; i < modelData.getAnalytics().getNS().size(); i++) {
        		ns[i] = modelData.getAnalytics().getNS().get(i);
        	}
        	sensorData.setNS(ns);

//        	int[] pi = new int[modelData.getAnalytics().getPI().size()];
//        	for (int i = 0; i < modelData.getAnalytics().getPI().size(); i++) {
//        		pi[i] = modelData.getAnalytics().getPI().get(i);
//        	}
        	// no PI in cumulocity object
        	// sensorData.setPI(pi);

        	double[] om = new double[modelData.getAnalytics().getOM().size()];
        	for (int i = 0; i < modelData.getAnalytics().getOM().size(); i++) {
        		om[i] = modelData.getAnalytics().getOM().get(i);
        	}
        	sensorData.setOM(om);
        	
        	double[] nw = new double[modelData.getAnalytics().getNW().size()];
        	for (int i = 0; i < modelData.getAnalytics().getNW().size(); i++) {
        		nw[i] = modelData.getAnalytics().getNW().get(i);
        	}
        	sensorData.setNW(nw);
        	
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return sensorData;
    }

    public double[] getRootCause(final String sensorId, final int clusterId) throws HttpServerErrorException {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        double[] sensorRC;
        try {
        	GetRootCauseResponse modelRC = client.getClusterRootCause(sensorId, clusterId);
        	
        	// TODO remove conversion if using boonamber models
        	sensorRC = new double[modelRC.getRootCauseList().get(0).size()];
        	for (int i = 0; i < modelRC.getRootCauseList().get(0).size(); i++) {
        		sensorRC[i] = modelRC.getRootCauseList().get(0).get(i).getValue();
        	}
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return sensorRC;
    }

    public boolean isConnected() {
        return client != null;
    }

}
