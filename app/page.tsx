"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import { styled } from "@mui/system";
import AdSlot from "@/components/AdSlot";

interface HistoryItem {
  role: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: "1rem",
  marginTop: "1rem",
  marginBottom: "1rem",
  fontFamily: "Open Sans, sans-serif",
});

const StyledButton = styled(Button)({
  height: "56px", // to match TextField height
});

const FixedAppBar = styled(AppBar)({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
});

export default function Home() {
  const [question, setQuestion] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<any | null>(null);
  const [adVisible, setAdVisible] = useState<boolean>(false);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setAd(null);
    setAdVisible(false);

    scrollToBottom();

    try {
      // Kick off answer request
      const askPromise = axios.post("/api/ask", { question, history });

      // Await classify first so the ad can render during loading
      try {
        const { data: cls } = await axios.post("/api/classify", { question });
        if (cls?.creative && !cls.blocked && cls?.sponsor) {
          setAd(cls);
          setAdVisible(true);
        }
      } catch (e) {
        console.error("Error classifying:", e);
      }

      // Then await the answer
      const { data: ask } = await askPromise;
      setHistory([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: ask.answer },
      ]);
      setAnswer(ask.answer);
      setQuestion("");
    } catch (error) {
      console.error("Error fetching the answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer("");
    setQuestion("");
    setAd(null);
    setAdVisible(false);
    scrollToBottom();
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, history]);

  return (
    <>
      <FixedAppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              style={{ flexGrow: 1, fontFamily: "Roboto, sans-serif" }}
            >
              Simple Ask
            </Typography>
            <Button color="inherit" onClick={handleNewConversation}>
              New Conversation
            </Button>
          </Toolbar>
        </Container>
      </FixedAppBar>

      <Container
        maxWidth="md"
        style={{
          marginTop: "120px",
          fontFamily: "Roboto, sans-serif",
          marginBottom: "250px",
        }}
      >
        {history.length > 0 && (
          <List>
            {history.map((item, index) => (
              <StyledPaper elevation={3} key={index}>
                <Typography variant="body1" component="div">
                  <strong>
                    {item.role.charAt(0).toUpperCase() + item.role.slice(1)}:
                  </strong>
                </Typography>
                <Box
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: item.content.replace(/\n/g, "<br />"),
                  }}
                />
              </StyledPaper>
            ))}
          </List>
        )}
        <StyledPaper elevation={3}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <TextField
              label="Ask a question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading} // Disable input while loading
            />
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Ask
            </StyledButton>
          </form>
        </StyledPaper>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            {adVisible && ad?.creative ? (
              <Box sx={{ width: "100%" }}>
                <AdSlot creative={ad.creative} />
              </Box>
            ) : (
              <CircularProgress />
            )}
          </Box>
        )}
      </Container>
    </>
  );
}
