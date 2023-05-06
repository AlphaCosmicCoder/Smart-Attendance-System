# RFID Smart Attendance System implemented with NodeMCU and Node.js
![image](https://user-images.githubusercontent.com/105705266/236620410-0cea44c1-7b37-4f82-a050-587ffc973a45.png)

This document outlines the implementation plan for a smart attendance system using NodeMCU and RFID technology.

## Objectives
The main objectives of this system are:
-   To automate attendance taking process for increased efficiency.
-   To provide real-time attendance tracking for better monitoring.
-   To reduce manual errors in attendance recording.
-   To provide an easy-to-use interface for both students and teachers.

## System Components
The system will consist of the following components:
-   RFID reader modules to scan student ID cards. The RFID module used for the smart attendance system is the mfrc522 module.
-   NodeMCU to process attendance data.
-   JSON files to store attendance records.
-   Web interface for students and teachers to view attendance records.

## Implementation Plan
1.  Install and configure RFID reader modules at appropriate locations.
2.  Develop a NodeMCU program to receive attendance data from the RFID readers and send the card data to a Node.js server.
    -   The NodeMCU program will send the card data to a Node.js server for processing.
3.  The NodeMCU program will send the card data to a Node.js server for processing. From there, the server endpoints will handle the data and write it to a JSON file for storage.
4.  The web interface for viewing attendance records is built using the EJS view engine and CSS, along with JavaScript for interactivity.
5.  Test the system thoroughly to ensure accuracy and reliability.

## Connection Diagram of MFRC22 with NodeMCU ESP8266
The table shows the pin connections between MFRC522 and NodeMCU ESP8266:
| MFRC522 Pin | NodeMCU ESP8266 Pin |
|-------------|---------------------|
| SDA         | D4                  |
| SCK         | D5                  |
| MOSI        | D7                  |
| MISO        | D6                  |
| IRQ         | N/A (not connected) |
| GND         | GND                 |
| RST         | D0                  |
| 3.3V        | 3V3                 |

## Pin Mapping of LEDs and Buzzer
The table outlines the pin mapping for the LEDs and buzzer:
| Component | Pin |
| --- | --- |
| Green LED | D1 |
| Red LED | D2 |
| Yellow LED | D3 |
| Buzzer | D8 |

## NodeMCU Program Explanation
The program in `rfid.ino` reads the ID from an RFID card using an MFRC522 module and sends the ID to a NodeJS server using an HTTP POST request. If the Node.js server returns a response of "approved," the program will turn on an LED connected to pin D3 and a buzzer connected to pin D8 to indicate a successful attendance. If the server returns a response of "denied," the program will turn on an LED connected to pin D2 and the buzzer to indicate that the scan was unsuccessful. 

The program first includes the required libraries, such as the WiFi and HTTPClient libraries for ESP32 boards, or the ESP8266WiFi and ESP8266HTTPClient libraries for ESP8266 boards. It also includes the SPI library for communicating with the MFRC522 module.

The program sets the SS and RST pins of the MFRC522 module, initializes the WiFi connection, and sets up the MFRC522 module. The program then enters an infinite loop, where it continuously checks for new RFID tags. If a new tag is detected, the program reads its ID and sends it to the Node.js server using an HTTP POST request. The server's response is checked, and if it is "approved," the program turns on the LED and buzzer connected to pins D3 and D8. If the response is "denied," the program turns on the LED and buzzer connected to pin D2 and D8. The program then waits for the user to remove the RFID tag from the reader before it continues scanning for new tags.

The program sets up the pins for the MFRC522 module and initializes it. It also sets up the pins for the output devices (D1, D2, D3, and D8) and sets the baud rate for serial communication.

In the loop() function, the program waits for a new card to be detected by the MFRC522 module. Once a card is detected, the program reads its ID and sends it to the NodeJS server using an HTTP POST request. If the NodeJS server responds with "denied", the program sets the D2 and D8 pins to HIGH and waits for 300ms.

The program also includes two helper functions to print the ID in hexadecimal and decimal formats.

Note that this program assumes that the NodeJS server is set up to receive the RFID ID and status in the format "&rfid=ID&status=STATUS".

## API Endpoints
The endpoints that work in the `index.js` file:
| Endpoint          | HTTP Method | Description                                              |
| ----------------- | ----------- | -------------------------------------------------------- |
| `/dailyreport`    | `GET`       | Renders the `report` view with `title` variable set to `"form"` |
| `/dailyreport`    | `POST`      | Renders the `report` view with attendance data for the given date |
| `/register`       | `GET`       | Renders the `studentRegister` view                      |
| `/register`       | `POST`      | Adds a new student record to `students.json` and assigns them a card |
| `/`               | `POST`      | Adds a new card record to `card.json`                     |
| `/startattendance`| `POST`      | Starts a new attendance record for the current date in `attendance.json` | 

Note that some of these endpoints share the same path but have different HTTP methods, which allows them to perform different actions depending on the request method.

## Conclusion
This smart attendance system using NodeMCU and RFID technology will provide a more efficient and accurate way of taking attendance. It will also provide real-time tracking and an easy-to-use interface for both students and teachers.
