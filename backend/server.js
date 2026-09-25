const http = require('node:http')
const { URL } = require('node:url')

const PORT = 3000

const server = http.createServer(async (request, response) => {
	const requestUrl = new URL(request.url, `http://${request.headers.host}`)

	response.setHeader('Access-Control-Allow-Origin', '*')
	response.setHeader('Content-Type', 'application/json')

	if (request.method === 'GET' && requestUrl.pathname === '/api/matchup') {
		const type = requestUrl.searchParams.get('type')?.trim()

		if (!type) {
			response.writeHead(400)
			response.end(JSON.stringify({ error: 'A type query parameter is required' }))
			return
		}

		try {
			const pokeApiResponse = await fetch(
				`https://pokeapi.co/api/v2/type/${encodeURIComponent(type)}/`,
			)
			const pokeApiData = await pokeApiResponse.json()

			if (!pokeApiResponse.ok) {
				response.writeHead(pokeApiResponse.status)
				response.end(JSON.stringify(pokeApiData))
				return
			}

			const { half_damage_to: halfDamageTo, double_damage_from: doubleDamageFrom } =
				pokeApiData.damage_relations
			const responseBody = {
				half_damage_to: halfDamageTo.map(({ name }) => name),
				double_damage_from: doubleDamageFrom.map(({ name }) => name),
			}

			response.writeHead(200)
			response.end(JSON.stringify(responseBody))
		} catch (error) {
			console.error('PokéAPI request failed:', error)
			response.writeHead(502)
			response.end(JSON.stringify({ error: 'Unable to reach PokéAPI' }))
		}
		return
	}

	response.writeHead(404)
	response.end(JSON.stringify({ error: 'Route not found' }))
})

server.listen(PORT, () => {
	console.log(`Backend running at http://localhost:${PORT}`)
})
