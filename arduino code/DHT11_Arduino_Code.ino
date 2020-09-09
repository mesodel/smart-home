#include <dht.h>
#include <SoftwareSerial.h>

SoftwareSerial EEBlue(10, 11); //RX | TX
dht DHT;
#define dataPin 13
char* request = NULL;

void setup() {
  Serial.begin(9600);
  EEBlue.begin(9600);
}

void loop() {
  int readData = DHT.read11(dataPin);
  float temperature = DHT.temperature;
  int humidity = DHT.humidity;
  if (EEBlue.available()) {
    String sentence = EEBlue.readString();
    Serial.print(sentence);
    if(request) {
      delete[] request;
    }
    if (sentence == "humidity") {
      request = new char[50];
      sprintf(request, "{\"humidity\": %d}", (int)humidity);
      Serial.print(request);  
      EEBlue.write(request);
    }
    else if (sentence == "temperature") {
      request = new char[50];
      sprintf(request, "{\"temperature\": %d}", (int)temperature);
      Serial.print(request);  
      EEBlue.write(request);
    }
    else if (sentence == "temperature&humidity") {
      request = new char[50];
      sprintf(request, "{\"temperature\": %d, \"humidity\": %d}", (int)temperature, humidity);
      Serial.print(request);  
      EEBlue.write(request);
    }
  }
  delay(2000);
}