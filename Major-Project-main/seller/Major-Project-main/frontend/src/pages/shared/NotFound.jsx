import React from 'react';
import { Result, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div className="flex flex-col items-center">
            <Paragraph>
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </Paragraph>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <Link to="/">
                <Button type="primary" icon={<HomeOutlined />}>
                  Back to Home
                </Button>
              </Link>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default NotFound; 