import React, { useEffect, useState } from 'react'

import interImg from './assets/inter.jpg'
import milanImg from './assets/milan.jpg'
import romaImg from './assets/roma.jpg'

import interAud from './assets/inter.mp3'
import milanAud from './assets/milan.mp3'
import romaAud from './assets/roma.mp3'

type DataElement = {
	teamName: string
	suitColour: string
	img: string
	scream: string
}
const data: DataElement[] = [
	{ teamName: 'AC Milan', img: milanImg, scream: milanAud, suitColour: 'Rød' },
	{ teamName: 'AS Roma', img: romaImg, scream: romaAud, suitColour: 'Grønn' },
	{ teamName: 'FC Inter', img: interImg, scream: interAud, suitColour: 'Blå' },
]

export function Oppgave1() {
	const [selected, setSelected] = useState<null | DataElement>(null)

	const [render, setRender] = useState(!selected)

	useEffect(() => {
		if (selected) {
			setRender(false)
			requestAnimationFrame(() => void setRender(true))

			const aud = new Audio(selected.scream)

			return void aud.play()
		}
	}, [selected])

	return (
		<>
			<table>
				<thead>
					<tr>
						<th>Lag navn</th>
						<th>Drakt farge</th>
						<th>Select</th>
					</tr>
				</thead>
				<tbody>
					{data.map((x) => (
						<tr key={x.teamName}>
							<td>{x.teamName}</td>
							<td>{x.suitColour}</td>
							<td>
								{selected?.teamName !== x.teamName ? (
									<button onClick={() => setSelected(x)}>Select</button>
								) : (
									<button onClick={() => setSelected(null)}>Deselect</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{render && selected && (
				<div className='anim-in'>
					<h1>{selected.teamName}</h1>
					<p>{selected.suitColour}</p>
					<img src={selected.img} alt={selected.teamName} />
				</div>
			)}
		</>
	)
}
