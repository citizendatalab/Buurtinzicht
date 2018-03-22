(function(window, document, undefined) {
  var parent, parentName, data, area, query;
  var els = document.getElementsByTagName('script');
  var resizer = false;
  var widgets = document.getElementsByClassName('bi-widget');

  for (var i = 0; i < widgets.length; i++) {
    data = widgets[i].getAttribute('data');
    area = widgets[i].getAttribute('area');
    type = widgets[i].getAttribute('type')
    widgets[i].id = 'bi-widget-' + i;
    parentName = widgets[i].getAttribute('id');
    parent = document.getElementById(parentName);
    var frame = document.createElement('iframe');
    if (data.indexOf('GRP') != -1) {
      query = 'group=' + data + '&area=' + area + '&class=group';
      // query = 'group=' + data + '&area=' + area + '&type=' + type;
      frame.src = 'https://buurtinzicht.nl/widget/group?' + query;
      // frame.src = 'http://localhost:3000/widget/group?' + query;
    } else {
      query = 'variable=' + data + '&area=' + area + '&class=single';
      // query = 'variable=' + data + '&area=' + area + '&type=' + type;
      frame.src = 'https://buurtinzicht.nl/widget/variable?' + query;
      // frame.src = 'http://localhost:3000/widget/variable?' + query;
    }
    frame.width = '100%';
    frame.height = '600px';
    frame.frameBorder = '0';
    frame.scrolling = 'no';
    frame.setAttribute("style", "min-width: 500px;")
    parent.appendChild(frame);
  }

  // TODO: Clean scripts

})(window, document);
