package com.brisa.controleEstoque.common;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateConverter {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public static String convertLocalDateTimeToString(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null; // todo exception
        }
        return dateTime.format(formatter);
    }

    public static LocalDateTime convertStringToLocalDateTime(String dateTimeString) {
        try {
            return LocalDateTime.parse(dateTimeString, formatter);
        } catch (DateTimeParseException e) {
            e.printStackTrace(); // todo exception
            return null; // todo exception
        }
    }
}