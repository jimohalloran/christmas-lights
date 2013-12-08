Arduino
===================

Based on version 1.0.1 of @sundar's makefile for Arduino found at https://github.com/sudar/Arduino-Makefile.  

To build an Arduino sketch, change to the sketch folder and run:

```bash
make && make upload
```

I installed Device::SerialPort on my machine (Mac OS 10.8 or 10.9) using system perl and:

```bash
cpan install Device::SerialPort
```


Controller
====================

Node.js application.

Requires the serialport package.

```bash
npm install serialport
```
