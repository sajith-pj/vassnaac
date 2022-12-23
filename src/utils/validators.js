import validator from 'validator';

export const isRequired = (val) =>{
    if(!val) return "*Required"
    return ''
}

export const validateEmail = (val) =>{
    if(!val) return "*Required"
    if(!validator.isEmail(val)) return "*Enter a valid email"
    return ''
}

export const validateMobile = (val) =>{
    if(!val) return "*Required"
    if(isNaN(val)) return "*Invalid Number"
    if(val.length < 10) return "*Invalid Number"
    return ''
}

export const validateURL = (val) =>{
    if(!val) return "*Required"
    if(!validator.isURL(val)) return "*Invalid URL"
    return ''
}