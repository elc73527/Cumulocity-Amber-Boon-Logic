package com.softwareag.amber.service;

import com.softwareag.amber.client.AmberClient;
import com.softwareag.amber.client.AmberCredentials;
import com.softwareag.amber.model.AmberSensor;
import com.softwareag.amber.model.AmberSensorConfiguration;
import com.softwareag.amber.model.AmberStreamData;
import com.softwareag.amber.model.ServiceDataStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;

import java.net.http.HttpResponse;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AmberService {

    private static final String ERROR_CONNECTION_NOT_ESTABLISHED = "Amber connection not established!";

    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private ScheduledFuture<?> connectionRenewalTask;

    private AmberClient client;

    public HttpResponse<String> checkAuthentication(final String url, final String username, final String password) {
        return AmberClient.authenticate(url, new AmberCredentials(username, password));
    }

    public void initializeConnection(final String url, final String username, final String password) {
        initClient(url, username, password);
        scheduleConnectionRenewal(url, username, password);
    }

    public void clearConnection() {
        client = null;
    }

    public Optional<AmberSensor> getSensor(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.getSensor(sensorId);
    }

    public AmberSensor createSensor() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.createSensor();
    }

    public void deleteSensor(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        client.deleteSensor(sensorId);
    }

    public AmberSensor[] getSensors() {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.getSensors();
    }

    public AmberSensorConfiguration getSensorConfiguration(final String sensorId) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.getSensorConfiguration(sensorId);
    }

    public AmberSensorConfiguration createSensorConfiguration(final String sensorId, final AmberSensorConfiguration configuration) {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.createSensorConfiguration(sensorId, configuration);
    }

    public AmberStreamData streamData(final String sensorId, final ServiceDataStream serviceDataStream) throws HttpServerErrorException {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.streamData(sensorId, serviceDataStream);
    }

    public double[] getRootCause(final String sensorId, final int clusterId) throws HttpServerErrorException {
        if (!isConnected()) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CONNECTION_NOT_ESTABLISHED);
        }

        return client.getRootCause(sensorId, clusterId);
    }

    public boolean isConnected() {
        return client != null;
    }

    private void initClient(final String url, final String username, final String password) {
        client = new AmberClient(url, new AmberCredentials(username, password));
    }

    private void scheduleConnectionRenewal(final String url, final String username, final String password) {
        if (!isConnected()) {
            log.error(ERROR_CONNECTION_NOT_ESTABLISHED);
            return;
        }

        if (connectionRenewalTask != null) {
            connectionRenewalTask.cancel(true);
        }

        connectionRenewalTask = scheduler.schedule(() -> {
            initializeConnection(url, username, password);
        }, client.getOAuthTokenExpiresTime(), TimeUnit.SECONDS);
    }
}
