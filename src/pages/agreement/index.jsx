import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axios";

const Agreement = () => {
  const navigate = useNavigate();
  const { agreementType } = useParams();
  const [agreements, setAgreements] = useState([]);
  const getTermsConditions = () => {
    axios
      .get("/adminapp/agreements", {
        params: { agreement: agreementType },
      })
      .then((response) => {
        setAgreements(response.data.data);
      });
  };
  useEffect(() => {
    getTermsConditions();
  }, []);

  return (
    <div className="agreement">
      {agreements.length > 0
        ? agreements.map((agreement, ky) => (
            <div key={ky}>
              <h5 className="text-color font-bold text-xl mb-2">
                {agreement?.title}
              </h5>
              <p className="text-sm mb-4">{agreement?.description}</p>
            </div>
          ))
        : ""}

      <span onClick={() => navigate(-1)}>Go Back</span>
    </div>
  );
};

export default Agreement;
