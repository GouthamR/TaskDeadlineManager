(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['deadline-editor-subtask-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<fieldset class=\"deadline-editor-form-subtask\">\r\n	<legend>SubTask:</legend>\r\n	<label>\r\n	    Title\r\n	    <input type=\"text\" class=\"deadline-editor-form-subtask-title-input\" name=\"title\" autofocus=\"true\" value=\""
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\">\r\n	</label>\r\n	<label>\r\n	    Start\r\n	    <input type=\"date\" class=\"deadline-editor-form-subtask-start-date-input\" name=\"start-date\" value=\""
    + alias4(((helper = (helper = helpers.startDate || (depth0 != null ? depth0.startDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"startDate","hash":{},"data":data}) : helper)))
    + "\">\r\n	</label>\r\n	<input type=\"time\" class=\"deadline-editor-form-subtask-start-time-input\" name=\"start-time\" value=\""
    + alias4(((helper = (helper = helpers.startTime || (depth0 != null ? depth0.startTime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"startTime","hash":{},"data":data}) : helper)))
    + "\">\r\n	<label>\r\n	    End\r\n	    <input type=\"date\" class=\"deadline-editor-form-subtask-end-date-input\" name=\"end-date\" value=\""
    + alias4(((helper = (helper = helpers.endDate || (depth0 != null ? depth0.endDate : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"endDate","hash":{},"data":data}) : helper)))
    + "\">\r\n	</label>\r\n	<input type=\"time\" class=\"deadline-editor-form-subtask-end-time-input\" name=\"end-time\" value=\""
    + alias4(((helper = (helper = helpers.endTime || (depth0 != null ? depth0.endTime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"endTime","hash":{},"data":data}) : helper)))
    + "\">\r\n	<input type=\"button\" class=\"deadline-editor-form-subtask-remove-button\" value=\"-\">\r\n</fieldset>";
},"useData":true});
})();