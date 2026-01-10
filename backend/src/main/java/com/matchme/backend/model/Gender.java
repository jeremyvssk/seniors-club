package com.matchme.backend.model;

public enum Gender {
    MAN("man"),
    WOMAN("woman"),
    OTHER("other");

    private final String value;

    Gender(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Gender fromString(String value) {
        for (Gender gender : Gender.values()) {
            if (gender.value.equalsIgnoreCase(value)) {
                return gender;
            }
        }
        throw new IllegalArgumentException("Invalid gender: " + value);
    }
}