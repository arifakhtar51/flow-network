import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ethers } from 'ethers';
import './Home.css';

function Closed({ contract }) {
  const [closedCampaigns, setClosedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchData, setFetchData] = useState(true);

  const getClosedCampaigns = async () => {
    if (fetchData) {
      setLoading(true);
      setError(null);

      try {
        if (!contract) {
          throw new Error("Contract not initialized. Please connect your wallet.");
        }

        const allCampaigns = await contract.getCampaigns();
        const currentTime = Math.floor(Date.now() / 1000);

        const campaignsWithIds = allCampaigns.map((campaign, index) => ({
          ...campaign,
          id: index,
          amountCollected: ethers.utils.formatEther(campaign.amountCollected),
          target: ethers.utils.formatEther(campaign.target),
          deadline: campaign.deadline.toNumber()
        }));

        const closed = campaignsWithIds.filter(campaign => {
          const { deadline } = campaign;
          return deadline <= currentTime;
        });

        setClosedCampaigns(closed);
      } catch (error) {
        console.error("Error loading closed campaigns:", error);
        setError("Failed to load closed campaigns. Please Connect to Story Aeneid Testnet.");
      } finally {
        setFetchData(false);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getClosedCampaigns();
  }, [fetchData]);

  const calculateProgress = (collected, target) => {
    return (parseFloat(collected) / parseFloat(target)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Closed NFTs
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          View all the NFTs that have been closed or expired.
        </p>
      </div>

      {/* Closed Campaigns Section */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <Spinner animation="border" variant="light" />
          </div>
        ) : closedCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-white mb-4">No Closed NFTs Found</h3>
            <p className="text-gray-300">There are currently no closed NFTs to display.</p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {closedCampaigns.map((campaign, index) => {
              const progress = calculateProgress(campaign.amountCollected, campaign.target);

              return (
                <Col key={index} className="d-flex align-items-stretch">
                  <div className="card custom-card">
                    <img
                      className="card-img-top"
                      src={campaign.image}
                      alt={campaign.title}
                      style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJkMzc0OCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{campaign.title}</h5>
                      <p className="card-text">{campaign.description}</p>
                      <p><strong>Price:</strong> {campaign.target} IP</p>
                      <p><strong>Collected:</strong> {campaign.amountCollected} IP</p>
                      <p><strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className="text-danger">Closed</span></p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}

export default Closed; 