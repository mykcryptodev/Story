import { createSlice } from "@reduxjs/toolkit";
import { ContractClient } from "../clients/contractClient";
import { appError, openWindow } from "./appSlice";
import { toStories } from "../utils";
import { BigNumber } from "ethers";

const initialState = {
  loading: false,
  account: null,
  contractClient: null,
  stories: [],
  pricePerChar: BigNumber.from(0),
  transaction: null,
  tokenIdWithBalance: {},
  numberOfOwnedTokens: null,
  canMintWithTitle: false,
  svgString: ""
};

export const blockchainSlice = createSlice({
  name: "blockchain",
  initialState,
  reducers: {
    initSuccess: (state, action) => {
      state.contractClient = action.payload.contractClient;
    },
    connectRequest: state => {
      state.loading = true;
    },
    connectSuccess: (state, action) => {
      state.loading = false;
      state.account = action.payload.account;
      state.numberOfOwnedTokens = action.payload.numberOfOwnedTokens;
    },
    fetchDataRequest: state => {
      state.loading = true;
    },
    fetchDataSuccess: (state, action) => {
      state.loading = false;
      state.stories = action.payload.stories;
      state.pricePerChar = action.payload.pricePerChar;
      state.numberOfOwnedTokens = action.payload.numberOfOwnedTokens;
      state.canMintWithTitle = action.payload.canMintWithTitle;
    },
    checkBalanceRequest: state => {
      state.loading = true;
    },
    checkBalanceSuccess: (state, action) => {
      state.loading = false;
      state.tokenIdWithBalance = action.payload;
    },
    withdrawFundRequest: state => {
      state.loading = true;
    },
    withdrawFundSuccess: (state, action) => {
      state.loading = false;
      //@ts-ignore
      state.tokenIdWithBalance.balance = BigNumber.from(0);
      state.transaction = action.payload.transaction;
    },
    previewMintRequest: state => {
      state.loading = true;
    },
    previewMintSuccess: (state, action) => {
      state.loading = false;
      state.svgString = action.payload.svgString;
    },
    mintRequest: state => {
      state.loading = true;
    },
    mintSuccess: (state, action) => {
      state.loading = false;
      state.transaction = action.payload.transaction;
    },
    clearTransaction: state => {
      state.transaction = null;
    }, // TODO might be able to move this to MintConfirmation
    error: state => {
      state.loading = false;
    },
    updateAccount: (state, action) => {
      state.account = action.payload.account;
    }
  }
});

export const {
  initSuccess,
  connectRequest,
  connectSuccess,
  fetchDataRequest,
  fetchDataSuccess,
  checkBalanceRequest,
  checkBalanceSuccess,
  withdrawFundRequest,
  withdrawFundSuccess,
  previewMintRequest,
  previewMintSuccess,
  mintRequest,
  mintSuccess,
  error,
  clearTransaction,
  updateAccount
} = blockchainSlice.actions;

export const connect = () => async (dispatch, getState) => {
  dispatch(connectRequest());
  try {
    const state = getState();
    const { contractClient } = state.blockchain;
    const account = await ContractClient.connectWallet();
    const numberOfOwnedTokens = (
      await contractClient.getNumberOfOwnedTokens(account)
    ).toNumber();
    dispatch(connectSuccess({ account, numberOfOwnedTokens }));
  } catch (err) {
    dispatch(error());
    dispatch(appError(err.message));
  }
};

export const mint =
  (text: string, parentId: number) => async (dispatch, getState) => {
    dispatch(mintRequest());
    try {
      const state = getState();
      const { contractClient } = state.blockchain;
      const txn = await contractClient.mint(text, parentId);
      dispatch(
        mintSuccess({
          transaction: txn
        })
      );
    } catch (err) {
      dispatch(error());
      dispatch(appError(err.message));
    }
  };

export const mintWithTitle =
  (title: string, text: string) => async (dispatch, getState) => {
    dispatch(mintRequest());
    try {
      const state = getState();
      const { contractClient } = state.blockchain;
      const txn = await contractClient.mintWithTitle(title, text);
      dispatch(
        mintSuccess({
          transaction: txn
        })
      );
    } catch (err) {
      dispatch(error());
      dispatch(appError(err.message));
    }
  };

export const fetchData = () => async (dispatch, getState) => {
  dispatch(fetchDataRequest());
  try {
    const state = getState();
    const { contractClient, account } = state.blockchain;
    const pricePerChar = await contractClient.getPricePerChar();
    const tokens = await contractClient.getAllTokens();
    const canMintWithTitle = await contractClient.canMintWithTitle(
      BigNumber.from(tokens.length)
    );
    const stories = toStories(tokens);
    const numberOfOwnedTokens = account
      ? (await contractClient.getNumberOfOwnedTokens(account)).toNumber()
      : null;
    dispatch(
      fetchDataSuccess({
        stories,
        pricePerChar,
        numberOfOwnedTokens,
        canMintWithTitle
      })
    );
  } catch (err) {
    dispatch(error());
    dispatch(appError(err.message));
  }
};

export const checkBalance = tokenId => async (dispatch, getState) => {
  dispatch(checkBalanceRequest());
  try {
    const state = getState();
    const { contractClient } = state.blockchain;
    const balance = await contractClient.getBalanceOf(BigNumber.from(tokenId));
    dispatch(checkBalanceSuccess({ tokenId, balance }));
  } catch (err) {
    dispatch(error());
    dispatch(appError(err.message));
  }
};

export const withdrawFund =
  (tokenId, balance) => async (dispatch, getState) => {
    dispatch(withdrawFundRequest());
    try {
      const state = getState();
      const { contractClient } = state.blockchain;
      const txn = await contractClient.withdraw(tokenId, balance);
      dispatch(
        withdrawFundSuccess({
          transaction: txn
        })
      );
    } catch (err) {
      dispatch(error());
      dispatch(appError(err.message));
    }
  };

export const previewMint =
  (text, creator, title) => async (dispatch, getState) => {
    dispatch(previewMintRequest());
    try {
      const state = getState();
      const { contractClient } = state.blockchain;
      const svgString = await contractClient.generateSvg(text, creator, title);
      dispatch(
        previewMintSuccess({
          svgString
        })
      );
    } catch (err) {
      dispatch(error());
      dispatch(appError(err.message));
    }
  };

export default blockchainSlice.reducer;
