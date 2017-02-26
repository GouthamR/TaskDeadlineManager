(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['deadline-editor-subtask-template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "		checked\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

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
    + "\">\r\n	<input type=\"checkbox\" class=\"deadline-editor-form-subtask-done-input\"\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isDone : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	>\r\n	<input type=\"button\" class=\"deadline-editor-form-subtask-remove-button\" value=\"-\">\r\n</fieldset>";
},"useData":true});
templates['index-edit-mode-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<form>\r\n	<input type=\"text\" value=\""
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "\">\r\n	<input type=\"submit\" value=\"Done\">\r\n</form>";
},"useData":true});
templates['index-normal-mode-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<img class=\"td-check\" src=\"img/check.png\">\r\n<div class=\"item-middle\">\r\n	<p class=\"item-title\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</p>\r\n	<p>"
    + alias4(((helper = (helper = helpers.dayTimeString || (depth0 != null ? depth0.dayTimeString : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"dayTimeString","hash":{},"data":data}) : helper)))
    + "</p>\r\n</div>\r\n<img class=\"td-settings\" src=\"img/gear.png\">";
},"useData":true});
})();