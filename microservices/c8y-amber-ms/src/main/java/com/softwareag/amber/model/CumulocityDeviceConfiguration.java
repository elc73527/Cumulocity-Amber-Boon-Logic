package com.softwareag.amber.model;

import lombok.Data;

import javax.validation.constraints.NotNull;

import com.boonamber.models.PostConfigRequest;

@Data
public class CumulocityDeviceConfiguration {

    private String id;

    private @NotNull PostConfigRequest configuration;

    private @NotNull CumulocityDataPoint[] dataPoints;
}
