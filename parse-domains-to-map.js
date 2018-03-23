let fs = require('fs')

let data = fs.readFileSync('domains.tsv').toString().trim().split('\n').map(l => {
	// if(!l){
	// 	return null
	// }
	// if((l.match(/"/) || []).length >1) {
	// 	return l.split('"')[0].split(',').concat([l.split('"')[1].split('"')[0]]).concat(l.split('"')[1].split('"')[1].split(',')).filter(arr => arr.length === 0)
	// }

	// else return l.trim().split(',')
	return l.trim().split('\t')
	})

let domains = {}
let journals = {}

data.forEach(line => {
	if (line[1] === 0 || line[1] === '#N/A' || line[2] === 0 || line[2] === "#N/A") return

	journals[line[0]] = {domains: [{name: line[2], weight: 1}], disciplines: [{name: line[1]}]}

	if(line[3] != '#N/A' && line[3] != 0) journals[line[0]].domains.push({name: line[3], weight: 1})
	if (!domains[line[2]]) {
		domains[line[2]] = {}
	}

})


fs.writeFileSync('domains.json', JSON.stringify(domains,0,4))
fs.writeFileSync('journals.json', JSON.stringify(journals,0,4))