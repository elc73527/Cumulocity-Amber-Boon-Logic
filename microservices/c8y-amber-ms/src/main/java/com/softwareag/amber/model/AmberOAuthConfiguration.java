package com.softwareag.amber.model;

import lombok.Data;

@Data
public class AmberOAuthConfiguration {

    private String idToken;

    private String expiresIn;

    private String refreshToken;

    private String tokenType;
}
