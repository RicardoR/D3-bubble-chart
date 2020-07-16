// Less waste space with a square layout (the more rectangular the container is, the more space is lost)
const width = 400;
const height = 400;
const backButton = d3.select('#back');

let minRadiousValue, maxRadiousValue;

if (width > height) {
  maxRadiousValue = height / 5;
  minRadiousValue = maxRadiousValue / 4;
} else {
  maxRadiousValue = width / 5;
  minRadiousValue = maxRadiousValue / 4;
}

const data = [
  {
    region: 'Europe',
    percentaje: '60',
    shared: [20, 80],
    countries: [
      { region: 'Spain', percentaje: 2, shared: [20, 80] },
      { region: 'Portugal', percentaje: 4, shared: [30, 70] },
      { region: 'Germany', percentaje: 12, shared: [10, 20] },
      { region: 'France', percentaje: 50, shared: [5, 95] },
      { region: 'Switzerland', percentaje: 20, shared: [30, 70] },
    ],
  },
  { region: 'Apac', percentaje: 20, shared: [30, 70] },
  { region: 'Africa', percentaje: 4, shared: [20, 80] },
  { region: 'North America', percentaje: 6, shared: [15, 85] },
  { region: 'ANZ', percentaje: 2, shared: [4, 96] },
  { region: 'Sourth America', percentaje: 8, shared: [30, 70] },
];

initGraph(data);

function initGraph(data) {
  // Pack only works if exists an object with children attr:
  const dataFormatted = { children: data };

  d3.select('svg').remove();
  const svg = d3.select('#bubble-chart').append('svg');

  var maxValue = d3.max(d3.entries(data).map((x) => x.value.percentaje));
  var minValue = d3.min(d3.entries(data).map((x) => x.value.percentaje));

  var scale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([minRadiousValue, maxRadiousValue]);

  var myColor = d3
    .scaleOrdinal()
    .domain([minValue, maxValue])
    .range(d3.schemePastel1);

  svg.attr('width', width).attr('height', height).attr('class', 'bubble');

  const bubble = d3
    .pack()
    .size([width, height])
    .padding(30)
    .radius((d) => scale(d.data.percentaje));

  const root = d3.hierarchy(dataFormatted);

  const arc = d3.arc().innerRadius(0);
  const pie = d3.pie();

  const nodeData = bubble(root).children;
  const nodes = svg.selectAll('g.node').data(nodeData);

  const nodeEnter = nodes
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .attr('class', (d) =>
      d.data.countries && d.data.countries.length > 0 ? 'group' : ''
    )
    .on('click', (d) => {
      if (d.data.countries && d.data.countries.length > 0) {
        initGraph(d.data.countries);
        backButton.classed('hidden', false);
      }
    });

  const arcGs = nodeEnter.selectAll('g.arc').data((d) => {
    return pie(d.data.shared).map((m) => {
      m.r = d.r;
      m.regionData = d.data;
      return m;
    });
  });

  const arcEnter = arcGs.enter().append('g').attr('class', 'arc');
  arcEnter
    .append('path')
    .attr('d', (d) => {
      arc.outerRadius(d.r);
      return arc(d);
    })
    .style('fill', (d, i) =>
      i === 0 ? 'darkseagreen' : myColor(d.regionData.percentaje)
    );

  const regionLabels = nodeEnter
    .selectAll('text.name-label')
    .data((d) => [d.data.region]);

  regionLabels
    .enter()
    .append('text')
    .attr('dy', '1em')
    .attr('class', 'name-label label')
    .text(String);

  const regionValues = nodeEnter
    .selectAll('text.value-label')
    .data((d) => [d.data.percentaje + '%']);

  regionValues
    .enter()
    .append('text')
    .attr('dy', '2em')
    .attr('class', 'value-label label')
    .text(String);

  arcEnter
    .append('text')
    .attr('x', (d) => {
      arc.outerRadius(d.r);
      return arc.centroid(d)[0];
    })
    .attr('y', (d) => {
      arc.outerRadius(d.r);
      return arc.centroid(d)[1];
    })
    .attr('dy', '0.35')
    .attr('class', 'label')
    .text((d, i) => (i === 0 ? d.value : ''));
}

function backToRegionView() {
  initGraph(data);
  backButton.classed('hidden', true);
}
