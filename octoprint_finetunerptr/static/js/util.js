var collapseAllBootstrapAccordionPanels = function(index) {
   var elements = document.getElementsByClassName('eepromCollapse');
   for (var i = 0; i < elements.length; i++) {
      if (i !== index) {
         elements[i].style.transition = "all 0.5s ease-in;";
         elements[i].style.height = "0px";
         elements[i].classList.remove("in");
      }
   }
};



var updateFavorites = function(data) {
  //  console.log("############# updateFavorites clicked #############");
   var _fullname = "__eepromSettings__favorites";
   var savedData = JSON.parse(localStorage.getItem(_fullname));

   var _localStorageData = {
      'eepromFavorites': new Array()
   };
   // Load known favorites from localStorage
   if (savedData && data) {
      var knownEntry = (savedData.indexOf(data.description) !== -1);
      for (var i in savedData) {
         _localStorageData.eepromFavorites.push(savedData[i]);
      }
   } else if (savedData && !data) {
      for (var i in savedData) {
         _localStorageData.eepromFavorites.push(savedData[i]);
      }
   }

   // Dont add entry if already member
   if (!knownEntry && data && data.description) {
      // console.log("dataDescription via onClick injected: \n", data);
      _localStorageData.eepromFavorites.push(data.description);
      localStorage.setItem(_fullname, JSON.stringify(_localStorageData.eepromFavorites));
   }

   scopeFavorites(_localStorageData.eepromFavorites);
};

var scopeFavorites = function(favArray) {
   return new Promise(function(resolve, reject) {
      let promises = [];
      // console.log("#scopeFavorites");
      self.categorizedEeprom[0].EEPROM_Descriptions = favArray;

      for (var favArrCount = 0; favArrCount < favArray.length; favArrCount++) {
         let prom = new Promise(function(resolve, reject) {
            getEepromValue(favArray[favArrCount])
               .then(function(dataObj){
                  var eepromValuesObj = {
                     'category': dataObj.category,
                     'description': dataObj.description,
                     'value': dataObj.value,
                     'Icon': dataObj.Icon,
                     'dataType': dataObj.dataType,
                     'origValue': dataObj.origValue,
                     'position': dataObj.position,
                  };
                  resolve(eepromValuesObj);
               });
         });
         promises.push(prom);
      }
      Promise.all(promises).then(function(values) {
         self.categorizedEeprom[0].EEPROM_Values([]);
         for (let v in values) {
            self.categorizedEeprom[0].EEPROM_Values.push(values[v]);
         }
         resolve(self.categorizedEeprom[0].EEPROM_Values());
      });
   });
};

var getEepromValue = function(description){
   return new Promise(function(resolve, reject) {
      var output = {};
      for (var i = 0; i < self.categorizedEeprom.length; i++) {
         for (var j = 0; j < self.categorizedEeprom[i].EEPROM_Values().length; j++) {
            if (self.categorizedEeprom[i].EEPROM_Values()[j].description == description) {
               self.categorizedEeprom[i].EEPROM_Values()[j].Icon = self.categorizedEeprom[i].Icon;
               output = self.categorizedEeprom[i].EEPROM_Values()[j];
               resolve(output);
            }
         }
      }
      reject("Error:: " + description);
   });
};
