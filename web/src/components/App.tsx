import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, updateAccount, initSuccess } from "../redux/blockchainSlice";
import * as s from "../styles/globalStyles";
import styled from "styled-components";
import { MintConfirmation } from "./MintConfirmation";
import { ContractClient } from "../clients/contractClient";
import { DesktopItem } from "./DesktopItem";
import { toStories } from "../utils";

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector(state => state.blockchain);
  const app = useSelector(state => state.app);
  const [input, setInput] = useState("");
  const [mintConfirmationVisible, setMintConfirmationVisible] = useState(false);
  const [displayedError, setDisplayedError] = useState("");

  useEffect(() => {
    setDisplayedError(blockchain.errorMsg);
  }, [blockchain.errorMsg]);

  useEffect(() => {
    setDisplayedError(app.errorMsg);
  }, [app.errorMsg]);

  useEffect(() => {
    const initContract = async () => {
      try {
        // @ts-ignore checked in initContract
        const { ethereum } = window;
        const { provider, contract } = await ContractClient.initContract();
        const contractClient = new ContractClient(provider, contract);
        const tokens = await contractClient.getAllTokens();
        const stories = toStories(tokens);
        dispatch(initSuccess({ contractClient, stories }));

        ethereum.on("accountsChanged", accounts => {
          dispatch(updateAccount({ account: accounts[0] }));
        });
        ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (err) {
        setDisplayedError(err.message);
      }
    };

    initContract();
  }, []);
  // const [claimingNft, setClaimingNft] = useState(false);
  // const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  // const [mintAmount, setMintAmount] = useState(1);

  // const claimNFTs = () => {
  //   setClaimingNft(true);
  //   blockchain.smartContract.methods
  //     .mint(mintAmount)
  //     .send({
  //       gasLimit: String(totalGasLimit),
  //       to: CONFIG.CONTRACT_ADDRESS,
  //       from: blockchain.account,
  //       value: totalCostWei,
  //     })
  //     .once("error", (err) => {
  //       console.log(err);
  //       setFeedback("Sorry, something went wrong please try again later.");
  //       setClaimingNft(false);
  //     })
  //     .then((receipt) => {
  //       console.log(receipt);
  //       setFeedback(
  //         `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
  //       );
  //       setClaimingNft(false);
  //       dispatch(fetchData(blockchain.account));
  //     });
  // };

  // const getData = () => {
  //   if (blockchain.account !== "" && blockchain.contract !== null) {
  //     dispatch(fetchData(blockchain.account));
  //   }
  // };

  // useEffect(() => {
  //   getData();
  // }, [blockchain.account]);

  const toggleMintConfirmationVisible = () => {
    setMintConfirmationVisible(!mintConfirmationVisible);
  };

  const estimatedMintCost = () => {
    return input.length * 0.001;
  };

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
      >
        <DesktopItem title={"about.txt"} onClick={() => {}} />
        <StyledButton
          onClick={e => {
            e.preventDefault();
            dispatch(connect());
          }}
        >
          {blockchain.account ? blockchain.account : "CONNECT WALLET"}
        </StyledButton>
        <input
          type="textarea"
          name="textValue"
          onChange={e => setInput(e.target.value)}
        />
        <div>Estimated mint cost: {estimatedMintCost()} ether. </div>
        <StyledButton
          onClick={e => {
            e.preventDefault();
            toggleMintConfirmationVisible();
          }}
        >
          MINT
        </StyledButton>
        {mintConfirmationVisible ? (
          <MintConfirmation
            text={input}
            creator={""}
            parentId={0}
            toggleMintConfirmationVisible={toggleMintConfirmationVisible}
          />
        ) : null}
        {displayedError ? <div>{displayedError}</div> : null}
      </s.Container>
    </s.Screen>
  );
}

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

export default App;