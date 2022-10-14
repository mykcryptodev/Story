import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  mint,
  mintWithTitle,
  clearTransaction,
  fetchData
} from "../redux/blockchainSlice";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import { estimatedMintCost } from "../utils";
import { PopupModal, modalState } from "./PopupModal";
import { WindowHeader } from "./WindowHeader";

const MintConfirmation = ({
  text,
  parentId,
  pricePerChar,
  loading,
  transaction,
  svgString,
  onCloseMintConfirmation,
  setSaved
}) => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");

  const onMintSuccess = () => {
    dispatch(clearTransaction());
    dispatch(fetchData());
    onCloseMintConfirmation(true);
    setSaved(true);
  };

  return (
    <MintConfirmationWrapper>
      <WindowHeader
        title={"Confirm"}
        onClickCloseButton={() => onCloseMintConfirmation(false)}
      ></WindowHeader>
      <ContentWrapper>
        <MintPreview
          style={{
            backgroundImage: `url("${svgString}")`,
            width: "350px",
            height: "350px"
          }}
        />
        {parentId === -1 ? (
          <div>
            New story title:{" "}
            <input onChange={e => setNewTitle(e.target.value)}></input>
          </div>
        ) : null}
        <Text>
          Saving this snippet will mint an ERC721 token on Ethereum with all
          data on-chain. The mint cost will be{" "}
          {estimatedMintCost(text.length, pricePerChar)} ether plus gas. Are you
          sure you want to proceed?
        </Text>
        <ContentButtonWrapper>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              onCloseMintConfirmation(false);
            }}
          >
            Cancel
          </ContentButton>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              parentId === -1
                ? dispatch(mintWithTitle(newTitle, text))
                : dispatch(mint(text, parentId));
            }}
          >
            Confirm
          </ContentButton>
        </ContentButtonWrapper>
      </ContentWrapper>
      {transaction ? (
        <PopupModal
          state={modalState.SUCCESS}
          message={[
            "Mint successful. Check your transaction on ",
            <a href={`${process.env.NEXT_ETHERSCAN_URL}`} target="_blank">
              Etherscan
            </a>,
            " and verify your token on ",
            <a href="https://opensea.io/account" target="_blank">
              Opensea
            </a>,
            "."
          ]}
          onClose={onMintSuccess}
          onOk={onMintSuccess}
        />
      ) : null}
    </MintConfirmationWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  creator: state.blockchain.account,
  pricePerChar: state.blockchain.pricePerChar,
  loading: state.blockchain.loading,
  transaction: state.blockchain.transaction,
  svgString: state.blockchain.svgString,
  ...ownProps
});

/** TODO: bottom icon, correct urls, estimate cost, loading preview, FE validate */

export default connect(mapStateToProps)(MintConfirmation);

const MintConfirmationWrapper = styled(StyledContainer)`
  position: absolute;
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const ContentButtonWrapper = styled.div``;

const ContentButton = styled(StyledButton)`
  margin: 10px;
`;

const Text = styled.div`
  text-align: center;
  margin: 0 10px;
`;

const MintPreview = styled.div``;
