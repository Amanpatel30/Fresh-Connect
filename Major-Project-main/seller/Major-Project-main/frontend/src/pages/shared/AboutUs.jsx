import React from 'react';
import { Typography, Row, Col, Card, Avatar, Divider, Space, Button } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  FacebookOutlined,
  InstagramOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'John Smith',
      role: 'Founder & CEO',
      avatar: 'https://via.placeholder.com/150',
      bio: 'John has over 15 years of experience in the food industry and is passionate about reducing food waste and supporting local farmers.',
      social: {
        linkedin: '#',
        twitter: '#',
        facebook: '#'
      }
    },
    {
      name: 'Sarah Johnson',
      role: 'Chief Operations Officer',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Sarah oversees all operations and ensures that our platform runs smoothly for all users, from farmers to hotel owners to customers.',
      social: {
        linkedin: '#',
        twitter: '#',
        instagram: '#'
      }
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Michael leads our development team and is responsible for the technical architecture of our platform, ensuring security and scalability.',
      social: {
        linkedin: '#',
        github: '#',
        twitter: '#'
      }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Marketing',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Emily develops our marketing strategies and works closely with our partners to promote sustainable food practices and reduce waste.',
      social: {
        linkedin: '#',
        instagram: '#',
        twitter: '#'
      }
    }
  ];

  return (
    <div className="about-us-container max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Title level={1}>About Us</Title>
        <Paragraph className="text-lg max-w-3xl mx-auto">
          We're on a mission to reduce food waste, support local farmers, and create a sustainable food ecosystem that benefits everyone.
        </Paragraph>
      </div>

      {/* Our Story */}
      <Row gutter={[32, 32]} className="mb-16">
        <Col xs={24} md={12}>
          <div className="h-full flex items-center">
            <div>
              <Title level={2}>Our Story</Title>
              <Paragraph>
                Founded in 2023, our platform was born from a simple observation: too much food goes to waste while many people struggle to access fresh, affordable produce.
              </Paragraph>
              <Paragraph>
                We started by connecting local vegetable farmers directly with consumers, eliminating middlemen and reducing costs. Soon, we expanded to include hotel and restaurant owners who could purchase in bulk and list their leftover food.
              </Paragraph>
              <Paragraph>
                Today, we're proud to offer a comprehensive platform that serves vegetable sellers, hotel owners, and consumers alike, all united by the common goal of reducing waste and promoting sustainable food practices.
              </Paragraph>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <img 
            src="https://via.placeholder.com/600x400?text=Our+Story" 
            alt="Our Story" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </Col>
      </Row>

      {/* Our Mission */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <Title level={2} className="text-center mb-8">Our Mission</Title>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card className="h-full text-center">
              <div className="text-4xl text-green-500 mb-4">🌱</div>
              <Title level={4}>Support Local Farmers</Title>
              <Paragraph>
                We provide vegetable sellers with a direct channel to consumers and businesses, ensuring fair prices and reducing waste.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full text-center">
              <div className="text-4xl text-blue-500 mb-4">🍽️</div>
              <Title level={4}>Reduce Food Waste</Title>
              <Paragraph>
                Our platform helps hotels and restaurants sell leftover food at discounted prices, preventing perfectly good food from going to waste.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full text-center">
              <div className="text-4xl text-purple-500 mb-4">🤝</div>
              <Title level={4}>Build Community</Title>
              <Paragraph>
                We connect consumers with local businesses, fostering a sense of community and promoting sustainable food practices.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Our Team */}
      <div className="mb-16">
        <Title level={2} className="text-center mb-8">Meet Our Team</Title>
        <Row gutter={[32, 32]}>
          {teamMembers.map((member, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                className="text-center h-full"
                cover={
                  <div className="pt-6 pb-2">
                    <Avatar src={member.avatar} size={100} />
                  </div>
                }
              >
                <Title level={4} className="mb-0">{member.name}</Title>
                <Text type="secondary">{member.role}</Text>
                <Paragraph className="mt-4">{member.bio}</Paragraph>
                <Space>
                  {member.social.linkedin && <Button type="link" icon={<LinkedinOutlined />} href={member.social.linkedin} target="_blank" />}
                  {member.social.twitter && <Button type="link" icon={<TwitterOutlined />} href={member.social.twitter} target="_blank" />}
                  {member.social.facebook && <Button type="link" icon={<FacebookOutlined />} href={member.social.facebook} target="_blank" />}
                  {member.social.instagram && <Button type="link" icon={<InstagramOutlined />} href={member.social.instagram} target="_blank" />}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Our Values */}
      <div className="mb-16">
        <Title level={2} className="text-center mb-8">Our Values</Title>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card className="h-full">
              <Title level={4}>Sustainability</Title>
              <Paragraph>
                We're committed to promoting sustainable food practices and reducing the environmental impact of food production and distribution.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full">
              <Title level={4}>Transparency</Title>
              <Paragraph>
                We believe in complete transparency in all our operations, from pricing to verification processes for sellers and hotels.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full">
              <Title level={4}>Community</Title>
              <Paragraph>
                We foster a sense of community among all our users, encouraging collaboration and mutual support in our shared mission.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <Title level={2} className="text-center mb-8">Get in Touch</Title>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <EnvironmentOutlined className="text-2xl text-blue-500 mb-2" />
              <Title level={5}>Address</Title>
              <Paragraph>
                123 Green Street<br />
                Eco City, EC 12345<br />
                Country
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <PhoneOutlined className="text-2xl text-blue-500 mb-2" />
              <Title level={5}>Phone</Title>
              <Paragraph>
                +1 (123) 456-7890<br />
                +1 (987) 654-3210
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <MailOutlined className="text-2xl text-blue-500 mb-2" />
              <Title level={5}>Email</Title>
              <Paragraph>
                info@example.com<br />
                support@example.com
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <GlobalOutlined className="text-2xl text-blue-500 mb-2" />
              <Title level={5}>Social Media</Title>
              <Space>
                <Button type="link" icon={<FacebookOutlined />} href="#" target="_blank" />
                <Button type="link" icon={<TwitterOutlined />} href="#" target="_blank" />
                <Button type="link" icon={<InstagramOutlined />} href="#" target="_blank" />
                <Button type="link" icon={<LinkedinOutlined />} href="#" target="_blank" />
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AboutUs; 