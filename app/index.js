import * as document from "document";
import { Barometer } from "barometer";
import { display } from "display";

// Constants 
const PA_TO_PSI = 6895;

// Data variables 
var isImperial = true; // If true, displays in hPa and feet units 
var hpaPressure; 
var psiPressure; 
var altitudeInFeet; 
var altitudeInMeters; 

// Retrieve elements 
var screen = document.getElementById("screen"); 
var unitsText = document.getElementById("units"); 
var pressureText = document.getElementById("pressure"); 
var altText = document.getElementById("alt"); 

// Initialize text fields with some values 
unitsText.text = "--"; 
pressureText.text = "---"; 
altText.text = "--"; 

// Event listener to change units by screen touch 
screen.addEventListener("click", () => { 
    isImperial = !isImperial; 
    displayData(); 
}); 

// Check if sensor on device 
if (Barometer) {
    const barometer = new Barometer({ frequency:2 });
    barometer.addEventListener("reading", () => {
        hpaPressure = barometer.pressure/100; 
        psiPressure = (hpaPressure*100/PA_TO_PSI); 
        altitudeInFeet = hPaToAlt(hpaPressure, true); 
        altitudeInMeters = hPaToAlt(hpaPressure, false); 
        displayData(); 
    });

    // Stop sensor when screen is off to conserve battery
    display.addEventListener("change", () => {
        display.on ? barometer.start() : barometer.stop();
    });
    
    barometer.start();
} else { 
    screen.removeEventListener("click", displayData); 
    unitsText.text = "Error"; 
    pressureText.text = "Barometer not"; 
    altText.text = "found on device."; 
}

// Given pressure as Pascals and true for units in feet (false for meters), estimates altitude ASL 
// https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
function hPaToAlt(hPa, ftOrMeters){ 
    let altInFt = (1-Math.pow((hPa/1013.25), 0.190284))*145366.45; 
    if(ftOrMeters) return altInFt; 
    else return altInFt*0.3048; 
}

// Display data to screen in desired units
function displayData(){ 
    if(isImperial){ 
        unitsText.text = "imperial"; 
        pressureText.text = (psiPressure).toFixed(2) + " psi"; 
        altText.text = altitudeInFeet.toFixed(0) + " ft ASL"; 
    } else { 
        unitsText.text = "metric"; 
        pressureText.text = (hpaPressure).toFixed(0) + " hPa"; 
        altText.text = altitudeInMeters.toFixed(0) + " m ASL"; 
    }
}