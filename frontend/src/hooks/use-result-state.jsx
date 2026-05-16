import * as React from 'react';

const useResultState = (error, loading, data) => {
	const { result, pagination, empty } = React.useMemo(() => {
		if (error || loading || !data || !data.data) {
			return {
				result: [],
				pagination: null,
				empty: false,
			};
		}

		const rows = data?.data?.rows || [];

		return {
			result: rows,
			pagination: data?.data?.pagination || null,
			empty: rows.length === 0,
		};
	}, [error, loading, data]);

	return { result, pagination, empty };
};

export { useResultState };
