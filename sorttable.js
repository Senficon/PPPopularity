

	// sorttable  v2
	// from http://c3o.org/code/dom/sorttable/


	var sorttable_uparrow = 'up.gif';
	var sorttable_downarrow = 'down.gif';
	var sorttable_sortbytext = 'Sort by ';

	window.onload = sorttable_init;

	var sorttable_isIEmac = (navigator.userAgent.toLowerCase().indexOf("msie") > -1 && navigator.userAgent.toLowerCase().indexOf("mac") > -1) ? true : false;
	sortlinks = new Array();

	function sorttable_init() {
		if(document.getElementById) { //not a stoneage browser

			var tables = document.getElementsByTagName('table');
			for(var i=0; i<tables.length;i++) {
				if(tables[i].className.indexOf('sortable') > -1 || tables[i].className.indexOf('sorttable') > -1) {
					if(tables[i].id == '') { tables[i].id = 'xtable'+i; } //unique id
					var tableid = tables[i].id;
					sortlinks[tableid] = new Array();
					var ths = tables[i].getElementsByTagName('th');
					if(ths.length == 0) { ths = tables[i].getElementsByTagName('tr')[0].getElementsByTagName('td'); }	

					for(var j=0; j<ths.length; j++) {					   	 //add sort links
						if(ths[j].className.indexOf('nosort') == -1) {
							var sortlink = document.createElement('a');
							sortlink.href = '#sort';
							sortlink.onclick = function() { return false }
							sortlink.id = 'sort'+j+tableid;
							sortlink.className = 'sortlink';
							sortlink.style.paddingRight = '10px';
							ths[j].datatype = (ths[j].getAttribute('datatype') != '') ? ths[j].getAttribute('datatype') : '';
							ths[j].tableid = tableid;
							ths[j].className = (ths[j].className.length > 0) ? ths[j].className+' sortheader' : 'sortheader';  //ie5mac doesnt like space in front of 1st class
							ths[j].columnindex = j;
							ths[j].onclick = function() { sorttable(this.firstChild.id, this.tableid, this.columnindex, this.datatype); return false }				
							if(sorttable_isIEmac) {
								sortlink.appendChild(ths[j].firstChild);	
							} else {	
								sortlink.innerHTML = ths[j].innerHTML;
								ths[j].innerHTML = '';	
							}
							ths[j].setAttribute('title', sorttable_sortbytext+sorttable_getInnerText(sortlink));
							ths[j].style.cursor = 'pointer';
							ths[j].appendChild(sortlink);
							var stidl = sortlinks[tableid].length;
							sortlinks[tableid][stidl] = sortlink;
						}
						if(ths[j].getAttribute('presort')) {
							ths[j].onclick();
						}
						if(ths[j].getAttribute('presort') == 'desc') {
							ths[j].onclick();
						}
					}	

				}
			}
		}
	}
	
	function sorttable(linkid, tableid, columnindex, datatype) {
 		//alert(tableid + ' ' + columnindex + ' ' + datatype);
		var link = document.getElementById(linkid);
		var table = document.getElementById(tableid);
		if (!sorttable_isIEmac) { table = table.getElementsByTagName('tbody').length > 0 ? table.getElementsByTagName('tbody')[0] : table; }
		var startat = (link.parentNode.nodeName == 'TD') ? 1 : 0;
		var rows = table.getElementsByTagName('tr');
		var cellvalues = new Array();
		var sortfn = 'changeme';

		//remove arrows
		for(var i=0; i<sortlinks[tableid].length; i++) {
			sortlinks[tableid][i].style.backgroundImage = 'none';
			sortlinks[tableid][i].parentNode.className = sortlinks[tableid][i].parentNode.className.replace(' sorted', '');
		}

		if(table.sortedcol == columnindex) { //only reverse

			for(var i=rows.length-1;i>=0+startat;i--) {
				if(rows[i].getElementsByTagName('th').length == 0) {
					table.appendChild(rows[i]);
				}
			}
			table.sorteddir = table.sorteddir * -1;
			var arrow = (table.sorteddir > 0) ? sorttable_uparrow : sorttable_downarrow;
		
			link.style.backgroundImage = 'url("'+arrow+'")';

		} else {							 //sort

			link.style.backgroundImage = 'url("'+sorttable_uparrow+'")';

			for(var i=startat;i<rows.length;i++) {
				if(rows[i].getElementsByTagName('th').length == 0) {
					var cell = rows[i].getElementsByTagName('td')[columnindex];
 					var cellval = sorttable_getInnerText(cell);
					if(sortfn == 'changeme') {
					    if (datatype == '123' || datatype == '1') { sortfn = sorttable_numeric; }
						else if (datatype == '$$$' || datatype == '$') { sortfn = sorttable_currency; }
					    else if (cellval.match(/^[\d\.]+$/)) { sortfn = sorttable_numeric; }
						else if (cellval.match(/^[£$€]/)) { sortfn = sorttable_currency; }	
						else { sortfn = ''; }
					}
					if(rows[i].id == '') { rows[i].id = tableid+'xrow'+i; } //unique id		

					cellvalues[cellvalues.length] = cellval + '|+|' + rows[i].id;
				}
			}

			if(sortfn != '') { cellvalues.sort(sortfn); } else { cellvalues.sort(); }
			for(var j=0;j<cellvalues.length; j++) {
				var cellsplit = cellvalues[j].split('|+|');
				var row = document.getElementById(cellsplit[1]);
				table.appendChild(row);
			}
			table.sortedcol = columnindex;
			table.sorteddir = 1;

		}
		link.style.backgroundPosition = 'center right'; 
		link.style.backgroundRepeat = 'no-repeat';
		link.parentNode.className += ' sorted';

		for(var i=0+startat;i<rows.length;i++) {
			var newclass = (i % 2 == 0) ? 'even' : 'odd';
			if(rows[i].className.indexOf('odd') > -1 || rows[i].className.indexOf('even') > -1) {
				var oldclass = (rows[i].className.indexOf('odd')>-1) ? 'odd' : 'even';
				rows[i].className = rows[i].className.replace(oldclass, newclass);
			} else {
				rows[i].className = (rows[i].className.length > 0) ? rows[i].className+' '+newclass : newclass;
			}
		}

	}


	function sorttable_numeric(a,b) { 
		var aa = a.split('|+|')[0];
		var bb = b.split('|+|')[0];
		return parseFloat(aa) - parseFloat(bb);
	}
	function sorttable_currency(a,b) { 
		var aa = a.split('|+|')[0].replace(/[^0-9.]/g,'');
		var bb = b.split('|+|')[0].replace(/[^0-9.]/g,'');
		if(aa == '') { return 1 }
		if(bb == '') { return -1 }
	    return (parseFloat(aa)-parseFloat(bb));
	}
	function sorttable_getInnerText(el) {
		if (typeof el == "string") return el;
		if (typeof el == "undefined") return el;
		if (el.innerText) return el.innerText;
		var str = '';
		var cs = el.childNodes;	var l = cs.length;
		for (var i = 0; i < l; i++) {
			switch (cs[i].nodeType) {
				case 1: //ELEMENT_NODE
					str += sorttable_getInnerText(cs[i]); break;
				case 3:	//TEXT_NODE
					str += cs[i].nodeValue; break;
			}
		}
		return str;
	}	

function sorttable_getStyle(x,styleProp) {
	if (window.getComputedStyle)
		var y = window.getComputedStyle(x,null).getPropertyValue(styleProp);
	else if (x.currentStyle)
		var y = eval('x.currentStyle.' + styleProp);
	return y;
}
