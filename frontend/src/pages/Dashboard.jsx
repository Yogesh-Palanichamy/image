function Dashboard() {
    return (
        <div className="container mt-5">
            <h2>Dashboard</h2>
            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5>Total Images</h5>
                            <h2>0</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5>Models</h5>
                            <h2>1</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h5>Accuracy</h5>
                            <h2>0%</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;