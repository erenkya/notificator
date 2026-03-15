# Application Architecture

## Stack

Mobile framework:
Expo React Native

Language:
TypeScript

State management:
Zustand

Local storage:
SQLite (expo-sqlite)

Notifications:
expo-notifications

Navigation:
Expo Router

---

## Data Model

Main entities:

Label
Activity
RecurrenceRule
Notification

Relationships:

Label
└ Activity
└ RecurrenceRule
└ Notification

---

## Core Modules

The application will be divided into the following modules.

Label Manager  
Activity Manager  
Schedule Engine  
Notification Engine  
Calendar Generator

---

## Folder Structure

src/

components  
screens  
features  
services  
store  
database  
utils

---

## Notification Engine

Activities can repeat:

daily  
weekly  
monthly

The notification system should schedule reminders locally on the device using expo-notifications.

Notifications should update automatically when activities change.
