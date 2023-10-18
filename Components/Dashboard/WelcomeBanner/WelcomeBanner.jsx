// ** Next, React And Locals Imports
import Greetings from "@/Helpers/Greetings.js";
import CustomImage from "@/Components/Image/CustomImage";
import useStyles from "./styles.js";

// ** MUI Imports
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";

function WelcomeBanner() {
  const { classes } = useStyles();

  return (
    <Card className={classes.bg}>
      <CardContent className={classes.content}>
        <Typography variant="h2">{Greetings()}</Typography>
        <CustomImage
          src={"/assets/greetingAvatar.webp"}
          alt="greeting avatar"
          fill={true}
        />
      </CardContent>
    </Card>
  );
}

export default WelcomeBanner;
