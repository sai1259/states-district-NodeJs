const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'covid19India.db')
module.exports = app
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Runnig at http://localhost/3000')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//API 1

app.get('/states/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      state;`

  const stateArray = await db.all(getPlayersQuery)
  response.send(stateArray)
})

//API 2

app.get('/states/:stateId', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `
    SELECT 
      *
    FROM
      state
    WHERE
      state_id = ${stateId};`

  const state = await db.get(getStateQuery)
  response.send(state)
})

//API 3

app.post('/districts/', async (request, response) => {
  const distrinctDetails = request.body
  const {distrinctName, stateId, cases, cured, active, deaths} =
    distrinctDetails
  const districtQuery = `
      INSERT INTO 
        district (district_name, state_id, cases, cured, active, deaths)
      VALUES
        (
          '${distrinctName}',
          '${stateId}',
          '${cases}',
          '${cured}',
          '${active}',
          '${deaths}'
        );`
  await db.run(districtQuery)
  response.send('District Successfully Added')
})

//API 4

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQuery = `
    SELECT 
      *
    FROM
      district
    WHERE
      district_id = '${districtId}';`
  const district = await db.get(getDistrictQuery)
  response.send(district)
})

//API 5

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrictQuery = `
      DELETE FROM
        district
      WHERE
        district_id = '${districtId}';`
  await db.run(deleteDistrictQuery)
  response.send('District Removed')
})

//API 6

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {distrinctName, stateId, cases, cured, active, deaths} = districtDetails
  const updateQueryParameter = `
    UPDATE
      district
    SET
      district_name = '${distrinctName}',
      state_id = '${stateId}',
      cases = '${cases}',
      cured = '${cured}',
      active = '${active}',
      deaths = '${deaths}'
    WHERE
      district_id = '${districtId}';`
  await db.run(updateQueryParameter)
  response.send('District Details Updated')
})

//API 7

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const districtDetails = request.body
  const {cases, cured, active, deaths} = districtDetails
  const totalQuerys = `
    SELECT
      COUNT('${cases}') AS totalCases,
      COUNT('${cured}') AS totalCured,
      COUNT('${active}') AS totalActive,
      COUNT('${deaths}') AS totalDeaths
    From
      district
    WHERE
      state_id = '${stateId}';`
  const totalCount = await db.get(totalQuerys)
  response.send(totalCount)
})

//API 8

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    select 
      state_id 
    from 
      district
    where 
      district_id = '${districtId}';`

  //With this we will get the state_id using district table

  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery)
  const getStateNameQuery = `
    select 
      state_name as stateName 
    from 
      state
    where 
      state_id = '${getDistrictIdQueryResponse.state_id}';`

  //With this we will get state_name as stateName using the state_id

  const stateName = await db.get(getStateNameQuery)
  response.send(stateName)
})
