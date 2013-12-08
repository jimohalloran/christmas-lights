
#include "Tlc5940.h"

String serialDataIn;

void setup() {
  /* Call Tlc.init() to setup the tlc and turn all channels off. */
  Tlc.init(0);

  /* Start serial comms */
  Serial.begin(19200);
  //Serial.setTimeout(30000);
  serialDataIn = "";
}


void processSet(int chan, int value) {
  int brightness = value * 16;
  
  Tlc.set(chan, brightness);
}


void processExe() {
  Tlc.update();
}


void processOff() {
  Tlc.clear();
}


void processCommand() {
  String type = serialDataIn.substring(0, 3);
  Serial.println(type);
  if (type == "OFF") {
    processOff();
  } else {
    if (type == "EXE") {
      processExe();

    } else {

      int delimIdx = serialDataIn.indexOf(',');
      int delimIdx2 = serialDataIn.indexOf(',', delimIdx+1);

      int channel = serialDataIn.substring(delimIdx+1, delimIdx2).toInt();
      int value = serialDataIn.substring(delimIdx2+1).toInt();

      if (type == "SET") {
        processSet(channel, value);
      } else {
        Serial.println("Unknown Command: "+serialDataIn);
      }
    }
  }
}


void loop() {
  byte inbyte;

  if (Serial.available()) {
    inbyte = Serial.read();
    if (inbyte ==  '\n') {  // end of line
      processCommand();
      Serial.println("ACK");
      serialDataIn = "";
    } else {
      serialDataIn += char(inbyte);
    }        
  }
}
