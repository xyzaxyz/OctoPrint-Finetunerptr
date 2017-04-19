// icons http://fontawesome.io/icons/
// 'icon' + IconName;
var categorizedEeprom = [{
      Name: 'Favorites',
      Icon: 'star',
      EEPROM_Descriptions: [],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'General',
      Icon: 'cog',
      EEPROM_Descriptions: [
         "Language",
         "Baudrate",
         "Filament printed [m]",
         "Printer active [s]",
         "Max. inactive time [ms,0=off]",
         "Stop stepper after inactivity [ms,0=off]",
         "Coating thickness [mm]",
         "Enable retraction conversion [0/1]",
         "Retraction length [mm]",
         "Retraction speed [mm/s]",
         "Retraction z-lift [mm]",
         "Extra extrusion on undo retract [mm]",
         "Retraction undo speed"
      ],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'Steps_Feedrate',
      Icon: 'random',
      EEPROM_Descriptions: [
         "X-axis steps per mm",
         "Y-axis steps per mm",
         "Z-axis steps per mm",
         "X-axis max. feedrate [mm/s]",
         "Y-axis max. feedrate [mm/s]",
         "Z-axis max. feedrate [mm/s]",
         "X-axis homing feedrate [mm/s]",
         "Y-axis homing feedrate [mm/s]",
         "Z-axis homing feedrate [mm/s]"
      ],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'Dimensions',
      Icon: 'fullscreen',
      EEPROM_Descriptions: [
         "X min pos [mm]",
         "Y min pos [mm]",
         "Z min pos [mm]",
         "X max length [mm]",
         "Y max length [mm]",
         "Z max length [mm]"
      ],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'Acceleration',
      Icon: 'superscript',
      EEPROM_Descriptions: [
         "Max. jerk [mm/s]",
         "Max. Z-jerk [mm/s]",
         "X-axis acceleration [mm/s^2]",
         "Y-axis acceleration [mm/s^2]",
         "Z-axis acceleration [mm/s^2]",
         "X-axis travel acceleration [mm/s^2]",
         "Y-axis travel acceleration [mm/s^2]",
         "Z-axis travel acceleration [mm/s^2]"
      ],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'Z_Probe',
      Icon: 'fire',
      EEPROM_Descriptions: [
         "Z-probe height [mm]",
         "Max. z-probe - bed dist. [mm]",
         "Z-probe speed [mm/s]",
         "Z-probe x-y-speed [mm/s]",
         "Z-probe offset x [mm]",
         "Z-probe offset y [mm]",
         "Z-probe X1 [mm]",
         "Z-probe Y1 [mm]",
         "Z-probe X2 [mm]",
         "Z-probe Y2 [mm]",
         "Z-probe X3 [mm]",
         "Z-probe Y3 [mm]",
         "Z-probe bending correction A [mm]",
         "Z-probe bending correction B [mm]",
         "Z-probe bending correction C [mm]",
         "Autolevel active (1/0)"
      ],
      EEPROM_Values: ko.observableArray([]),
   },
   {
      Name: 'Other',
      Icon: 'code-fork',
      EEPROM_Descriptions: [],
      EEPROM_Values: ko.observableArray([]),
   },
];
