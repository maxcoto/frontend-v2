import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolWarning, Pools } from '@/types/pools';
import { Network } from '../types';

const pools: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  BoostsEnabled: true,
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [],
  IncludedPoolTypes: [
    'Weighted',
    'Stable',
    'MetaStable',
    'GyroE',
    'ComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed2300020000000000000000002b', // wEth/rEth
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb200020000000000000000008b', // wstETH/wETH
      '0xacfe9b4782910a853b68abba60f3fd8049ffe6380000000000000000000000ff', // USDC/DOLA
      '0x004700ba0a4f5f22e1e78a277fca55e36f47e09c000000000000000000000104', // rEth/ankrEth
      '0x9da11ff60bfc5af527f58fd61679c3ac98d040d9000000000000000000000100', // usdc/usdcE/usdt/dai
      '0xc4ee406970047a70aed14621d97b3b460a7dea0b00000000000000000000010b', // SWEEP/USDC
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    AllowList: [
      '0x00b82bc5edea6e5e6c77635e31a1a25aad99f881000200000000000000000105', // OVN/wUSD
      '0xd6e5824b54f64ce6f1161210bc17eebffc77e031000100000000000000000006', // OP/BEETS/BAL
      '0x39965c9dab5448482cf7e002f583c812ceb53046000100000000000000000003', // WETH/OP/USDC
      '0xc1f46ce83439886f0ea9c21512b36e7e67239d2c000200000000000000000108', // beets/reth
    ],
  },
  Factories: {
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'metaStable',
    '0x230a59f4d9adc147480f03b0d3fffecd56c3289a': 'weightedPool',
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'weightedPool',
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'weightedPool',
    '0x043a2dad730d585c44fb79d2614f295d2d625412': 'composableStablePool',
    '0x9b683ca24b0e013512e2566b68704dbe9677413c': 'gyroE',
  },
  Stakable: {
    VotingGaugePools: [
      '0x4fd63966879300cafafbb35d157dc5229278ed2300020000000000000000002b',
      '0xde45f101250f2ca1c0f8adfc172576d10c12072d00000000000000000000003f',
      '0x981fb05b738e981ac532a99e77170ecb4bc27aef00010000000000000000004b',
      '0x359ea8618c405023fc4b98dab1b01f373792a12600010000000000000000004f',
      '0xb0de49429fbb80c635432bbad0b3965b2856017700010000000000000000004e',
      '0x6222ae1d2a9f6894da50aa25cb7b303497f9bebd000000000000000000000046',
      '0xc77e5645dbe48d54afc06655e39d3fe17eb76c1c00020000000000000000005c',
      '0x785f08fb77ec934c01736e30546f87b4daccbe50000200000000000000000041',
      '0x05e7732bf9ae5592e6aa05afe8cd80f7ab0a7bea00020000000000000000005a',
      '0x39965c9dab5448482cf7e002f583c812ceb53046000100000000000000000003',
      '0x1d95129c18a8c91c464111fdf7d0eb241b37a9850002000000000000000000c1',
      '0xd20f6f1d8a675cdca155cb07b5dc9042c467153f0002000000000000000000bc',
      '0x098f32d98d0d64dba199fc1923d3bf4192e787190001000000000000000000d2',
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb200020000000000000000008b',
      '0xcd7b2232b7435595bbc7fd7962f1f352fc2cc61a0000000000000000000000f0',
      '0x8a2872fd28f42bd9f6559907235e83fbf4167f480001000000000000000000f2',
      '0xbec621c9ab4ceddcc2a157ca9b5c475fab65f6a40000000000000000000000f3',
      '0xacfe9b4782910a853b68abba60f3fd8049ffe6380000000000000000000000ff',
      '0x9da11ff60bfc5af527f58fd61679c3ac98d040d9000000000000000000000100',
      '0x00b82bc5edea6e5e6c77635e31a1a25aad99f881000200000000000000000105',
      '0xc05ab1b0ad472ce802e2c8db6f23e4a2865fdca6000000000000000000000103',
      '0x5f8893506ddc4c271837187d14a9c87964a074dc000000000000000000000106',
      '0xc1f46ce83439886f0ea9c21512b36e7e67239d2c000200000000000000000108',
    ],
    AllowList: [],
  },
  Deep: [],
  BoostedApr: [],
  Metadata: {},
  DisabledJoins: [],
  BrandedRedirect: {
    Gyro2: 'gyro',
    Gyro3: 'gyro',
    GyroE: 'gyro',
  },
  Issues: {
    [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.OPTIMISM],
  },
};

export default pools;
