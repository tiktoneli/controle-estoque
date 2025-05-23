package com.brisa.controleEstoque.common;

import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;

public class CheckValues {

    public static void checkIntValue(Integer num) {
        if (num <= 0) {
            throw new ResourceBadRequestException("Can't assign zero or negative value");
        }
    }

    public static void checkLongValue(Long num) {
        if (num <= 0) {
            throw new ResourceBadRequestException("Can't assign zero or negative value");
        }
    }

}
