// execute once, needed in frontend
var opClient = new OctoPrintClient({
  baseurl: "",
  apikey: ""
});

function toggleNavbarDropdownPanel(strict) {
  var el = document.getElementsByClassName("finetunerptr_dropdown")[0]
  var currentDisplayState = el.style.display;
  el.style.display =
    strict || (currentDisplayState == "none") ? 'block' : 'none';
}

// executed before panel opens
function collapseAllBootstrapAccordionPanels(index) {
  var elements = document.getElementsByClassName('eepromCollapse');
  for (var i = 0; i < elements.length; i++) {
    if (i !== index) {
      elements[i].style.transition = "all 0.5s ease-in;";
      elements[i].style.height = "0px";
      elements[i].classList.remove("in");
    }
  }
};

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

function showNotLoggedInNotification() {
  new PNotify({
    title: 'FineTuneRptr',
    text: "You must be logged in to use this plugin."
  });
}

// closeAllNotifications
function closeAllNotifications() {
  var closeBtns = document.getElementsByClassName("icon-remove");
  for (var i = 0; i < closeBtns.length; i++) {
    closeBtns[i].click();
  }
}
