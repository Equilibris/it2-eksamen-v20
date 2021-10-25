export const qs = <T>(
	[p, ...xs]: T[],
	mapper: (v: T) => number = (v) => +v
): T[] =>
	p === undefined
		? []
		: qs(
				xs.filter((v) => mapper(v) < mapper(p)),
				mapper
		  ).concat([
				p,
				...qs(
					xs.filter((v) => mapper(v) >= mapper(p)),
					mapper
				),
		  ])
