import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Approuter from "./routes/Approuter";
import { fetchCurrentUser } from "./feature/AuthSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <Approuter />;
};

export default App;