import { useReducer, useRef, useState } from 'react'
import { qs } from './utils'

type Teams = 'AS Roma' | 'AC Milan' | 'FC Inter'

type Match = {
	teamA: string
	teamB: string

	aPoints: number
	bPoints: number
}
type Team = {
	id: number
	name: Teams
	nMatchups: number
	nWon: number
	nDrawn: number
	nLost: number
	goalsReceived: number
	goalsScored: number
	score: number
}

const teamInit = (name: Teams, id: number) => ({
	id: id,
	name,
	nMatchups: 0,
	nWon: 0,
	nDrawn: 0,
	nLost: 0,
	goalsReceived: 0,
	goalsScored: 0,
	score: 0,
})

type State = {
	matchHistory: Match[]

	matchUp: Team[]
}

type Action = { type: 'push'; match: Match }

enum Result {
	DRAW = 'Uavgjort',
	VICTORY = 'Seier',
	LOSS = 'Tap',
}

const getResult = (a: number, b: number) =>
	a === b ? Result.DRAW : a > b ? Result.VICTORY : Result.LOSS

const getPoints = (a: number, b: number) => (a === b ? 1 : a > b ? 3 : 0)

const reducer = (state: State, action: Action): State => {
	const clone: State = {
		matchHistory: [...state.matchHistory],
		matchUp: [...state.matchUp.map((x) => ({ ...x }))],
	}

	switch (action.type) {
		case 'push':
			const indexA = clone.matchUp.findIndex((x) =>
				x.name
					.toLocaleLowerCase()
					.includes(action.match.teamA.toLocaleLowerCase())
			)
			const indexB = clone.matchUp.findIndex((x) =>
				x.name
					.toLocaleLowerCase()
					.includes(action.match.teamB.toLocaleLowerCase())
			)

			clone.matchHistory.push({
				...action.match,
				teamA: clone.matchUp[indexA].name,
				teamB: clone.matchUp[indexB].name,
			})

			switch (getResult(action.match.aPoints, action.match.bPoints)) {
				case Result.DRAW:
					clone.matchUp[indexA].nDrawn++
					clone.matchUp[indexB].nDrawn++
					break

				case Result.VICTORY:
					clone.matchUp[indexA].nWon++
					clone.matchUp[indexB].nLost++
					break

				case Result.LOSS:
					clone.matchUp[indexA].nLost++
					clone.matchUp[indexB].nWon++
					break
			}

			clone.matchUp[indexA].score += getPoints(
				action.match.aPoints,
				action.match.bPoints
			)
			clone.matchUp[indexB].score += getPoints(
				action.match.bPoints,
				action.match.aPoints
			)

			clone.matchUp[indexA].nMatchups++
			clone.matchUp[indexB].nMatchups++

			clone.matchUp[indexA].goalsReceived += action.match.bPoints
			clone.matchUp[indexB].goalsReceived += action.match.aPoints

			clone.matchUp[indexA].goalsScored += action.match.aPoints
			clone.matchUp[indexB].goalsScored += action.match.bPoints

			return { ...clone }
	}
}

const fixInput = (e: React.ChangeEvent<HTMLInputElement>) => {
	const otherVal = e.currentTarget.value.replace(/(\..*$)|-/, '')
	if (e.currentTarget.value !== otherVal) e.currentTarget.value = otherVal
	if (+e.currentTarget.value < 0) e.currentTarget.value = '0'
}

const formInit: Match = {
	teamA: '',
	teamB: '',
	aPoints: 0,
	bPoints: 0,
}

const getSortKey: Record<keyof Team | 'diff', (any: Team) => number> = {
	diff: (team) => team.goalsReceived - team.goalsScored,
	id: (team) => team.id,
	goalsReceived: (team) => -team.goalsReceived,
	goalsScored: (team) => -team.goalsScored,
	nDrawn: (team) => -team.nDrawn,
	nLost: (team) => -team.nLost,
	nMatchups: (team) => -team.nMatchups,
	nWon: (team) => -team.nWon,
	score: (team) => -team.score,
	name: (team) =>
		[...team.name].reduce(
			(prev, curr, index) => prev + (2 * curr.charCodeAt(0)) / (index + 1) ** 2,
			0
		),
}

export const Oppgave2og3 = () => {
	const formElements: Record<
		'teamA' | 'teamB' | 'aPoints' | 'bPoints',
		React.RefObject<HTMLInputElement>
	> = {
		teamA: useRef<HTMLInputElement>(null),
		teamB: useRef<HTMLInputElement>(null),
		aPoints: useRef<HTMLInputElement>(null),
		bPoints: useRef<HTMLInputElement>(null),
	}

	const [sortKey, setSortKey] = useState<keyof typeof getSortKey>('id')

	const [form, setForm] = useState<Match>(formInit)

	const [state, dispatch] = useReducer(reducer, {}, (init) => ({
		matchHistory: [],
		matchUp: [
			teamInit('AS Roma', 1),
			teamInit('AC Milan', 2),
			teamInit('FC Inter', 3),
		],
	}))

	const selectedTeamA = state.matchUp.find((x) =>
		x.name.toLocaleLowerCase().includes(form.teamA.toLocaleLowerCase())
	)?.name
	const selectedTeamB = state.matchUp.find((x) =>
		x.name.toLocaleLowerCase().includes(form.teamB.toLocaleLowerCase())
	)?.name

	const teamAError =
		(!selectedTeamA && 'Ikke et valid team') ||
		(selectedTeamA === selectedTeamB && 'Kanke være samme team')
	const teamBError =
		(!selectedTeamB && 'Ikke et valid team') ||
		(selectedTeamA === selectedTeamB && 'Kanke være samme team')

	const lastMatch = state.matchHistory.reverse()[0]

	return (
		<>
			<h1>oppgave2og3</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault()
					if (!teamAError && !teamBError) {
						dispatch({ type: 'push', match: form })

						setForm(formInit)

						formElements.teamA.current!.value = ''
						formElements.teamB.current!.value = ''
						formElements.aPoints.current!.value = ''
						formElements.bPoints.current!.value = ''
					}
				}}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '10px',
					}}>
					<div>Team A</div>

					<div>
						<input
							ref={formElements.teamA}
							type='text'
							onChange={(e) =>
								setForm({ ...form, teamA: e.currentTarget.value })
							}
							onBlur={(e) => {
								if (selectedTeamA) e.currentTarget.value = selectedTeamA
							}}
						/>
						{teamAError}
					</div>

					<div>Team B</div>

					<div>
						<input
							ref={formElements.teamB}
							type='text'
							onChange={(e) =>
								setForm({ ...form, teamB: e.currentTarget.value })
							}
							onBlur={(e) => {
								if (selectedTeamB) e.currentTarget.value = selectedTeamB
							}}
						/>
						{teamBError}
					</div>

					<div>Points A</div>

					<div>
						<input
							ref={formElements.aPoints}
							type='number'
							onChange={(e) => {
								fixInput(e)

								setForm({ ...form, aPoints: +e.currentTarget.value })
							}}
						/>
					</div>

					<div>Points B</div>

					<div>
						<input
							ref={formElements.bPoints}
							type='number'
							onChange={(e) => {
								fixInput(e)

								setForm({ ...form, bPoints: +e.currentTarget.value })
							}}
						/>
					</div>
				</div>
				<button>Submit</button>
			</form>

			<div id='result'>
				{lastMatch && (
					<>
						<div>
							<h2>{lastMatch.teamA}</h2>
							<p>Resultat: {getResult(lastMatch.aPoints, lastMatch.bPoints)}</p>
							<p>Resultat: {getPoints(lastMatch.aPoints, lastMatch.bPoints)}</p>
							<p>Målforskjell: {lastMatch.aPoints - lastMatch.bPoints}</p>
						</div>
						<div>
							<h2>{lastMatch.teamB}</h2>
							<p>Resultat: {getResult(lastMatch.bPoints, lastMatch.aPoints)}</p>
							<p>Resultat: {getPoints(lastMatch.bPoints, lastMatch.aPoints)}</p>
							<p>Målforskjell: {lastMatch.bPoints - lastMatch.aPoints}</p>
						</div>
					</>
				)}
			</div>

			<table>
				<thead>
					<tr>
						<th>Kamp</th>
						<th>Resultat</th>
					</tr>
				</thead>
				<tbody>
					{state.matchHistory.map((value, index) => (
						<tr key={index}>
							<td>
								{value.teamA}-{value.teamB}
							</td>
							<td>
								{value.aPoints}-{value.bPoints}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<table id='mainTable'>
				<thead>
					<tr>
						<th>
							<button onClick={() => setSortKey('id')}>Nr lag</button>
						</th>
						<th>
							<button onClick={() => setSortKey('name')}>Navn</button>
						</th>
						<th>
							<button onClick={() => setSortKey('nMatchups')}>
								Antall kamper
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('nWon')}>
								Antall kamper vunnet
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('nDrawn')}>
								Antall kamper uavgjort
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('nLost')}>
								Antall kamper tapt
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('goalsScored')}>
								Egne mål (skårt)
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('goalsReceived')}>
								Mål mot (motatt)
							</button>
						</th>
						<th>
							<button onClick={() => setSortKey('diff')}>Målforskjell</button>
						</th>
						<th>
							<button onClick={() => setSortKey('score')}>Poengsum</button>
						</th>
					</tr>
				</thead>
				<tbody>
					{qs(state.matchUp, getSortKey[sortKey]).map((value, index) => (
						<tr key={value.id}>
							<td>{value.id}</td>
							<td>{value.name}</td>
							<td>{value.nMatchups}</td>
							<td>{value.nWon}</td>
							<td>{value.nDrawn}</td>
							<td>{value.nLost}</td>
							<td>{value.goalsScored}</td>
							<td>{value.goalsReceived}</td>
							<td>{value.goalsScored - value.goalsReceived}</td>
							<td>{value.score}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}
