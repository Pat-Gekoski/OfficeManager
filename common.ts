import concurrently from 'concurrently';
import * as cpx from 'cpx';

concurrently(
	[
		{
			command: "cpx './common/**/*.ts' 'apps/mobile/common' -v --clean  --watch",
		},
		{
			command: "cpx './common/**/*.ts' 'apps/admin/src/common' -v --clean  --watch",
		},
		{
			command: "cpx './common/**/*.ts' 'apps/api/src/common' -v --clean  --watch",
		},
	],
	{},
);
