package com.softwareag.amber.service;

import com.boonamber.AmberV2Client;
import com.boonamber.ApiException;
import com.boonamber.LicenseProfile;
import com.boonamber.models.*;
import com.boonamber.models.FeatureConfig.FusionRuleEnum;
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

    public Optional<PostModelResponse> getSensor(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        PostModelResponse model;
        try {
        	model = client.getModel(sensorId);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        
        return Optional.of(model);
    }

    public PostModelResponse createSensor() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        PostModelResponse model;
        try {
        	PostModelRequest label = new PostModelRequest();
            label.setLabel("Cumulocity-dashboard");
            
        	model = client.postModel(label);
        	
        	
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return model;
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

    public List<Model> getSensors() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        List<Model> models;
        try {
        	models = client.getModels().getModelList();
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return models;
    }

    public PostConfigResponse getSensorConfiguration(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        PostConfigResponse modelConfig;
        try {            
        	modelConfig = client.getConfig(sensorId);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

        return modelConfig;
    }

    public PostConfigResponse createSensorConfiguration(final String sensorId, final PostConfigRequest configuration) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
//        // TODO remove conversion to boonamber model
//        PostConfigRequest request = new PostConfigRequest();
//        request.setStreamingWindow(configuration.getStreamingWindow());
//        request.setPercentVariation((float)configuration.getPercentVariation());
//        // autotuning
//        AutotuneConfig ac = new AutotuneConfig();
//        ac.setPercentVariation(true);
//        ac.setRange(true);
//        request.setAutotuning(ac);
//        // training
//        TrainingConfig tc = new TrainingConfig();
//        tc.setBufferingSamples((int)configuration.getSamplesToBuffer());
//        tc.setHistoryWindow(configuration.getAnomalyHistoryWindow());
//        tc.setLearningMaxClusters(configuration.getLearningMaxClusters());
//        tc.setLearningMaxSamples((int)configuration.getLearningMaxSamples());
//        tc.setLearningRateNumerator((int)configuration.getLearningRateNumerator());
//        tc.setLearningRateDenominator((int)configuration.getLearningRateDenominator());
//        request.setTraining(tc);
//        // features
//        List<FeatureConfig> fc = new ArrayList<FeatureConfig>();
//        for (int i = 0; i < configuration.getFeatureCount(); i++) {
//        	FeatureConfig f = new FeatureConfig();
//        	f.setMaxVal((float)configuration.getFeatures()[i].getMaxVal());
//        	f.setMinVal((float)configuration.getFeatures()[i].getMinVal());
//        	f.setName(configuration.getFeatures()[i].getLabel());
//        	f.setFusionRule(FusionRuleEnum.fromValue(configuration.getFeatures()[i].getSubmitRule()));
//        	fc.add(f);
//        }
//        request.setFeatures(fc);
        
        PostConfigResponse modelConfig;
        try {            
        	modelConfig = client.postConfig(sensorId, configuration);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

        return modelConfig;
    }

    public PostDataResponse streamData(final String sensorId, final ServiceDataStream serviceDataStream) throws HttpServerErrorException {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }
        
        PostDataResponse modelData;
        try {
        	PostDataRequest request = new PostDataRequest();
        	request.setData(serviceDataStream.getData());
        	
        	modelData = client.postData(sensorId, request);
        } catch (ApiException e) {
        	throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return modelData;
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
