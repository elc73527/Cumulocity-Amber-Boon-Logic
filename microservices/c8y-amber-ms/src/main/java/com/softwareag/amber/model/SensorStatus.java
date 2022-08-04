package com.softwareag.amber.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SensorStatus {

    @JsonProperty
    private boolean isStreaming;
}
