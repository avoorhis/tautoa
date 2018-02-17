$( document ).ready(function() {
  
  (function(d3) {
        'use strict';
        var dataset = [
          { label: 'Abulia', count: 10 },
          { label: 'Betelgeuse', count: 20 },
          { label: 'Cantaloupe', count: 30 },
          { label: 'Dijkstra', count: 40 }
        ];
        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var color = d3.scaleOrdinal(d3.schemeCategory20b);
        var svg = d3.select('#chart1')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');
        var arc = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);
        var pie = d3.pie()
          .value(function(d) { return d.count; })
          .sort(null);
        
        var arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
			.data(pie(dataset))                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
			.enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
				.append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
					.attr("class", "slice");    //allow us to style things in the slices (like text)
			
			arcs.append("svg:path")
					.attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
					.attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
			
			arcs.append("svg:text")                                     //add a label to each slice
					.attr("transform", function(d) {                    //set the label's origin to the center of the arc
					//we have to make sure to set these before calling arc.centroid
					d.innerRadius = 0;
					d.outerRadius = radius;
					return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
				})
				.attr("text-anchor", "middle")                          //center the text on it's origin
				.text(function(d, i) { return dataset[i].label; });        //get the label from our original data array


        // var path = svg.selectAll('path')
//           .data(pie(dataset))
//           .enter()
//           .append('path')
//           .attr('d', arc)
//           .attr('fill', function(d) {
//             return color(d.data.label);
//           });
          
         
            
    })(window.d3);
    
});