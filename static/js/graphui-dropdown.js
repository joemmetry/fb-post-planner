 /**********************************************************************************
  **********************************************************************************
  *****
  *****   GraphUI Dropdown. graphui-dropdown.js
  *****   JavaScript library for dropdown menus
  *****   (c) 2014. Joseph Petilla, (c) 2014. Graphnote Inc. All rights reserved.
  *****     
  *****   Works with jQuery 1.11.0. Untested in other versions.
  *****
  **********************************************************************************
  **********************************************************************************/
 var isOpen = false;


/**! data-type: string,  format: (a,b,c,d,e,f); */
(dropdownizer = function(a,b,c,d,e,f){
  $(a).on('click', function(event){
    if(isOpen==false || !$(this).parent().hasClass(c))
    {
      event.preventDefault();
      $(b).removeClass(c);
      $(d).removeClass(f);
      event.stopPropagation();
      $(this).parent().addClass(c);
      $(this).parent().children(e).addClass(f);
      
      isOpen = true;
    }
  });

  $('html').on('click',function(){
    $(d).each(function(){
      $(d).removeClass(f);
        isOpen = false;
      });
      $(b).each(function(){
      $(b).removeClass(c);
    });
  });
})();

/**! data-type: string,  format: (a); */
(dropdowndisabler = function(a){  $(a + ' li.disabled').on('click',function(e){e.preventDefault();});})();


/** INITIALIZE */
dropdownizer(
  '.uiDropdown-button button.uiDropdown-selected, .uiDropdown-button input[type=submit],' +
        '.uiDropdown-button input[type=button], .uiDropdown-button a',
  '.uiDropdown-button', 
  'uiDropdownOpen', 
  '.uiDropdown-button ul', 
  'ul',
  'uiDropdown-toggler');
dropdowndisabler('.uiDropdown-menu');