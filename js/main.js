// Less waste space with a square layout (the more rectangular the container is, the more space is lost)
const width = 400;
const height = 400;

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
    countries: [
      { region: 'Spain', percentaje: '2' },
      { region: 'Portugal', percentaje: '4' },
      { region: 'Germany', percentaje: '12' },
      { region: 'France', percentaje: '50' },
      { region: 'Switzerland', percentaje: '20' },
    ],
  },
  { region: 'Apac', percentaje: '20' },
  { region: 'Dummy region 1', percentaje: '10' },
  { region: 'Africa', percentaje: '4' },
  { region: 'North America', percentaje: '2' },
  { region: 'ANZ', percentaje: '2' },
  { region: 'Sourth America', percentaje: '2' },
];

initGraph(data);

// d3.json('../data/data.json').then((data) => initGraph(data));

function initGraph(data) {
  data.forEach((element) => {
    element.percentaje = parseFloat(element.percentaje);
  });

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

  svg.attr('width', width).attr('height', height);

  const bubble = d3
    .pack()
    .size([width, height])
    .padding(30)
    .radius((d) => scale(d.data.percentaje));

  const root = d3.hierarchy(dataFormatted);

  const packedData = bubble(root);

  // Add groups
  const leaf = svg
    .selectAll('g')
    .data(packedData.leaves())
    .enter()
    .append('g')
    .attr('class', (d) =>
      d.data.countries && d.data.countries.length > 0 ? 'group' : ''
    )
    .on('click', (d) => {
      if (d.data.countries && d.data.countries.length > 0) {
        initGraph(d.data.countries);
      }
    })
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

  // Append circles to group
  leaf
    .append('circle')
    .attr('class', 'circle')
    .attr('r', (d) => d.r)
    .attr('fill', (d) => myColor(d.data.percentaje));

  // Append text node with name data
  leaf
    .append('text')
    .style('text-anchor', 'middle')
    .style('font-size', 12)
    .attr('fill', '#475464')
    .text((d) => d.data.region);

  // Append percentaje data
  leaf
    .append('text')
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', 12)
    .attr('fill', '#475464')
    .text((d) => `${d.data.percentaje} %`);
}
