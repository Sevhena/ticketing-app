import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios.request({
        url,
        method,
        data: body
      });

      console.log(response);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      console.log(err);
      if (err.response) {
        setErrors(
          <div className="alert alert-danger">
            <h4>Ooops....</h4>
            <ul className="my-0">
              {err.response.data.errors.map((err) => (
                <li key={err.message}>{err.message}</li>
              ))}
            </ul>
          </div>
        );
      }
    }
  };

  return { doRequest, errors };
};

export default useRequest;
