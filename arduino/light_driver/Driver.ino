
#include "Tlc5940.h"

void establishContact() {
while (Serial.available() <= 0) {
Serial.println("0,0,0"); //sendaninitialstring
delay(300); }
}

void setup() {
  /* Call Tlc.init() to setup the tlc and turn all channels off. */
  Tlc.init(0);

  /* Start serial comms */
  Serial.begin(9600);
  Serial.setTimeout(30000);
  establishContact();
}

void loop() {
  while (Serial.available() > 0) {
    int chan = Serial.parseInt();
    Serial.print("int1");
    Serial.print(chan);
    int bright = Serial.parseInt();
    Serial.print("int2");
    Serial.print(bright);

    if (Serial.read() == '\n') {
      Serial.print(255, HEX);
      chan = constrain(chan, 0, 7);
      bright = constrain(bright, 0, 4096);

      Tlc.set(chan, bright);
      Tlc.update();
      Serial.print("Output:");
      Serial.print(chan, HEX);
      Serial.print(bright, HEX);
    }
  }
}


