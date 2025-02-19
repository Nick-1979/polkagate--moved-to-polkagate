// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createWsEndpoints } from '@polkadot/apps-config';
import { Chain } from '@polkadot/extension-chains/types';

import { APIContext } from '../components';
import { sanitizeChainName } from '../util/utils';

export default function useApiWithChain(chain: Chain | undefined, api?: ApiPromise): ApiPromise | undefined {
  const apisContext = useContext(APIContext);
  const [_api, setApi] = useState<ApiPromise | undefined>();

  const maybeEndpoint = useMemo(() => {
    const chainName = sanitizeChainName(chain?.name);
    const allEndpoints = createWsEndpoints(() => '');

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [chain?.name]);

  useEffect(() => {
    if (api) {
      return setApi(api);
    }

    if (chain?.genesisHash && apisContext?.apis[chain.genesisHash]) {
      const maybeApi = apisContext?.apis[chain.genesisHash].api;

      if (maybeApi?.isConnected) {
        console.log(`♻ using the saved api for ${chain.name} in useApiWithChain`);

        return setApi(maybeApi);
      }
    }

    if (!maybeEndpoint) {
      return;
    }

    const wsProvider = new WsProvider(maybeEndpoint);

    ApiPromise.create({ provider: wsProvider }).then((a) => setApi(a)).catch(console.error);
  }, [api, apisContext, chain, maybeEndpoint]);

  return _api;
}
