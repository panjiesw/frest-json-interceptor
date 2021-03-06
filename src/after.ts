// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
	AfterResponseInterceptorArg,
	IAfterResponseInterceptor,
	ICommonInterceptor,
	WrappedFrestResponse,
} from 'frest';
import assign from 'object-assign';
import { ID_AFTER } from './ids';

export interface IJSONAfterResponseOption {
	force?: boolean;
}

const after: (options?: IJSONAfterResponseOption) => IAfterResponseInterceptor =
	(options: IJSONAfterResponseOption = {}) => {
		const interceptor: IAfterResponseInterceptor = (input: AfterResponseInterceptorArg) =>
			new Promise<WrappedFrestResponse<any>>((resolve, reject) => {
				const {origin} = input.response;
				const {headers, bodyUsed, status} = origin;
				const ct = headers.get('Content-Type');
				if (!bodyUsed) {
					if ((ct && ct.indexOf('application/json') >= 0) || options.force) {
						origin.json()
							.then((value) => {
								resolve({ origin, value });
							})
							.catch((err) => {
								if (status >= 201 && status <= 204) {
									resolve({ origin, value: null });
								} else {
									reject(err);
								}
							});
					}
				}
			});

		return assign<IAfterResponseInterceptor, ICommonInterceptor>(interceptor, { id: ID_AFTER });
	};

export { after };
