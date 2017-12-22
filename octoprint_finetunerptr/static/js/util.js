// execute once, needed in frontend
var opClient = new OctoPrintClient({
    baseurl: "",
    apikey: ""
});

// add / delete / update favorites
var updateFavorites = function(data, method) {
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

    switch (method) {
        case 0:
            // Delete
            if (knownEntry && data && data.description) {
                _localStorageData.eepromFavorites.splice(_localStorageData.eepromFavorites.indexOf(data.description), 1);
                localStorage.setItem(_fullname, JSON.stringify(_localStorageData.eepromFavorites));
            }
            break;
        case 1:
            // Add if not already member
            if (!knownEntry && data && data.description) {
                _localStorageData.eepromFavorites.push(data.description);
                localStorage.setItem(_fullname, JSON.stringify(_localStorageData.eepromFavorites));
            }
            break;
    }
}

// executed before panel opens
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

// clicking icon button in navbar
var toggleNavbarDropdownPanel = function(strict) {
    // block/none
    var el = document.getElementsByClassName("finetunerptr_dropdown")[0]
    var currentDisplayState = el.style.display;
    el.style.display =
        strict || (currentDisplayState == "none") ? 'block' : 'none';
}

// DropDown Menu specific methods + jQuery
//http://stackoverflow.com/a/2234986
function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

//http://stackoverflow.com/questions/3440022/mouse-click-somewhere-else-on-page-not-on-a-specific-div
(function($) {
    $.fn.outside = function(ename, cb) {
        return this.each(function() {
            var $this = $(this),
                self = this;
            $(document.body).bind(ename, function tempo(e) {
                if (e.target !== self && !$.contains(self, e.target)) {
                    cb.apply(self, [e]);
                    if (!self.parentNode) $(document.body).unbind(ename, tempo);
                }
            });
        });
    };
}(jQuery));

$('.finetunerptr_dropdownBtn').outside('click', function(e) {
    var el = document.getElementsByClassName("finetunerptr_dropdown")[0];
    var isChild = isDescendant(el, e.target);
    var isDropDownBody = (e.target.className === "finetunerptr_dropdown");
    var isDeleteBtn = (e.target.className === "icon-trash");
    if (!isChild && !isDropDownBody && !isDeleteBtn) {
        $('.finetunerptr_dropdown').hide();
    }
});
// /DropDown Menu specific methods + jQuery
