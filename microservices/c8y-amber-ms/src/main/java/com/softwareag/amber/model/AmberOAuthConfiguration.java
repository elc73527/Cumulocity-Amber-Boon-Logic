package com.softwareag.amber.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AmberOAuthConfiguration {

    private String idToken;

    private String expiresIn;

    private String refreshToken;

    private String tokenType;
}
