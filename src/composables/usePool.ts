import { Network, PoolType, PoolToken, AprBreakdown } from '@balancer-labs/sdk';
import { isAddress } from '@ethersproject/address';
import { getAddress } from 'ethers/lib/utils';
import { computed, Ref } from 'vue';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';
import { POOLS } from '@/constants/pools';
import { bnum, includesAddress, isSameAddress } from '@/lib/utils';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { configService } from '@/services/config/config.service';
import { AnyPool, Pool } from '@/services/pool/types';

import { isTestnet, urlFor } from './useNetwork';
import useNumbers, { FNumFormats, numF, bpToDec } from './useNumbers';

/**
 * METHODS
 */
export function addressFor(poolId: string): string {
  return getAddress(poolId.slice(0, 42));
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) || isMetaStable(poolType) || isStablePhantom(poolType)
  );
}

export function isUnknownType(poolType: any): boolean {
  return !Object.values(PoolType).includes(poolType);
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

export function isManaged(poolType: PoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment;
}

export function isWeightedLike(poolType: PoolType): boolean {
  return (
    isWeighted(poolType) ||
    isManaged(poolType) ||
    isLiquidityBootstrapping(poolType)
  );
}

export function isTradingHaltable(poolType: PoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType);
}

export function isWeth(pool: AnyPool): boolean {
  return includesAddress(
    pool.tokensList || [],
    configService.network.addresses.weth
  );
}

export function isMigratablePool(pool: AnyPool) {
  return POOL_MIGRATIONS.some(
    poolMigrationInfo => poolMigrationInfo.fromPoolId === pool.id
  );
}

export function noInitLiquidity(pool: AnyPool): boolean {
  return bnum(pool?.onchain?.totalSupply || '0').eq(0);
}

/**
 * @returns tokens that can be used to invest or withdraw from a pool
 */
export function lpTokensFor(pool: AnyPool): string[] {
  if (isStablePhantom(pool.poolType)) {
    const mainTokens = pool.mainTokens || [];
    const wrappedTokens = pool.wrappedTokens || [];
    return [...mainTokens, ...wrappedTokens];
  } else {
    return pool.tokensList || [];
  }
}

/**
 * @summary Orders pool token addresses by weight if weighted pool
 * @returns Array of checksum addresses
 */
export function orderedTokenAddresses(pool: AnyPool): string[] {
  const sortedTokens = orderedPoolTokens(
    pool.poolType,
    pool.address,
    pool.tokens
  );
  return sortedTokens.map(token => getAddress(token?.address || ''));
}

type TokenProperties = Pick<PoolToken, 'address' | 'weight'>;

/**
 * @summary Orders pool tokens by weight if weighted pool
 */
export function orderedPoolTokens<TPoolTokens extends TokenProperties>(
  poolType: PoolType,
  poolAddress: string,
  tokens: TPoolTokens[]
): TPoolTokens[] {
  if (isStablePhantom(poolType))
    return tokens.filter(token => !isSameAddress(token.address, poolAddress));
  if (isStableLike(poolType)) return tokens;
  return tokens
    .slice()
    .sort((a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0'));
}

/**
 * @summary returns full URL for pool id, given network.
 */
export function poolURLFor(
  poolId: string,
  network: Network,
  poolType?: string | PoolType
): string {
  console.log({ poolType, poolId, network });
  if (network === Network.OPTIMISM) {
    return `https://op.beets.fi/#/pool/${poolId}`;
  }
  if (poolType && poolType.toString() === 'Element') {
    return `https://app.element.fi/pools/${addressFor(poolId)}`;
  }

  return `${urlFor(network)}/pool/${poolId}`;
}

/**
 * @summary Calculates absolute max APR given boost or not.
 * If given boost returns user's max APR.
 * If not given boost returns pool absolute max assuming 2.5x boost.
 * Used primarily for sorting tables by the APR column.
 */
export function absMaxApr(aprs: AprBreakdown, boost?: string): string {
  if (boost) {
    const nonStakingApr = bnum(aprs.swapFees)
      .plus(aprs.tokenAprs.total)
      .plus(aprs.rewardAprs.total);
    const stakingApr = bnum(aprs.stakingApr.min).times(boost).toString();
    return nonStakingApr.plus(stakingApr).toString();
  }

  return aprs.max.toString();
}

/**
 * @summary Returns total APR label, whether range or single value.
 */
export function totalAprLabel(aprs: AprBreakdown, boost?: string): string {
  if (boost) {
    return numF(absMaxApr(aprs, boost), FNumFormats.percent);
  }

  const minAPR = numF(bpToDec(aprs.min), FNumFormats.percent);
  const maxAPR = numF(bpToDec(aprs.max), FNumFormats.percent);
  return `${minAPR} - ${maxAPR}`;
}

/**
 * @summary Checks if given pool is BAL 80/20 pool (veBAL)
 */
export function isVeBalPool(poolId: string): boolean {
  return POOLS.IdsMap['B-80BAL-20WETH'] === poolId;
}

/**
 * @summary Remove pre-minted pool token address from tokensList
 */
export function removePreMintedBPT(pool: Pool): Pool {
  pool.tokensList = pool.tokensList.filter(
    address => !isSameAddress(address, pool.address)
  );
  return pool;
}

/**
 * @summary Check if pool should be accessible in UI
 */
export function isBlocked(pool: Pool, account: string): boolean {
  const requiresAllowlisting =
    isStableLike(pool.poolType) || isManaged(pool.poolType);
  const isOwnedByUser =
    pool.owner && isAddress(account) && isSameAddress(pool.owner, account);
  const isAllowlisted =
    POOLS.Stable.AllowList.includes(pool.id) ||
    POOLS.Investment.AllowList.includes(pool.id);

  return (
    !isTestnet.value && requiresAllowlisting && !isAllowlisted && !isOwnedByUser
  );
}

/**
 * COMPOSABLE
 */
export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  const { fNum2 } = useNumbers();

  /**
   * Returns pool weights label
   */
  function poolWeightsLabel(pool: Pool): string {
    if (!pool?.onchain?.tokens) return '';

    if (isStableLike(pool.poolType)) {
      return Object.values(pool.onchain.tokens)
        .map(token => token.symbol)
        .join(', ');
    }

    return Object.values(pool.onchain.tokens)
      .map(
        token =>
          `${fNum2(token.weight, {
            style: 'percent',
            maximumFractionDigits: 0,
          })} ${token.symbol}`
      )
      .join(', ');
  }

  /**
   * COMPUTED
   */
  const isStablePool = computed(
    (): boolean => !!pool.value && isStable(pool.value.poolType)
  );
  const isMetaStablePool = computed(
    (): boolean => !!pool.value && isMetaStable(pool.value.poolType)
  );
  const isStablePhantomPool = computed(
    (): boolean => !!pool.value && isStablePhantom(pool.value.poolType)
  );
  const isStableLikePool = computed(
    (): boolean => !!pool.value && isStableLike(pool.value.poolType)
  );
  const isWeightedPool = computed(
    (): boolean => !!pool.value && isWeighted(pool.value.poolType)
  );
  const isWeightedLikePool = computed(
    (): boolean => !!pool.value && isWeightedLike(pool.value.poolType)
  );
  const isManagedPool = computed(
    (): boolean => !!pool.value && isManaged(pool.value.poolType)
  );
  const isLiquidityBootstrappingPool = computed(
    (): boolean => !!pool.value && isLiquidityBootstrapping(pool.value.poolType)
  );
  const managedPoolWithTradingHalted = computed(
    (): boolean =>
      !!pool.value && isManagedPool.value && !pool.value.onchain?.swapEnabled
  );
  const isWethPool = computed(
    (): boolean => !!pool.value && isWeth(pool.value)
  );
  const isWstETHPool = computed(
    (): boolean => !!pool.value && includesWstEth(pool.value.tokensList)
  );
  const noInitLiquidityPool = computed(
    () => !!pool.value && noInitLiquidity(pool.value)
  );

  const lpTokens = computed(() => {
    if (!pool.value) return [];

    return lpTokensFor(pool.value);
  });

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStablePhantomPool,
    isStableLikePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithTradingHalted,
    isWethPool,
    isWstETHPool,
    noInitLiquidityPool,
    lpTokens,
    // methods
    isStable,
    isMetaStable,
    isStablePhantom,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isTradingHaltable,
    isWeth,
    noInitLiquidity,
    lpTokensFor,
    isMigratablePool,
    poolWeightsLabel,
    orderedTokenAddresses,
    orderedPoolTokens,
  };
}
